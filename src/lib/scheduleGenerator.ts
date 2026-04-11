import { supabase } from './supabase';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toLocalDateStr = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const toHHMM = (t: string | null | undefined): string | null => {
  if (!t || t === '00:00' || t === '00:00:00') return null;
  return t.substring(0, 5);
};

const timeToMins = (t: string): number => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

const minsToTimeStr = (totalMins: number, baseDateStr: string): string => {
  const daysOffset = Math.floor(totalMins / (24 * 60));
  const minutesInDay = totalMins % (24 * 60);
  const h = Math.floor(minutesInDay / 60);
  const m = minutesInDay % 60;

  const [year, month, day] = baseDateStr.split('-').map(Number);
  const base = new Date(year, month - 1, day, h, m, 0);
  base.setDate(base.getDate() + daysOffset);
  
  return base.toISOString();
};

interface FreeSlot { startMins: number; endMins: number; }

/**
 * Compute free study slots for a day — pure code, no AI.
 * latestStart = sleepTime - focusDuration - 5min buffer
 * This guarantees the LAST block always ENDS at or before sleep time.
 */
function computeFreeSlots(
  wakeTime: string,
  sleepTime: string,
  collegeStart: string | null,
  collegeEnd: string | null,
  focusDuration: number,
): FreeSlot[] {
  const wM = timeToMins(wakeTime);
  const rawSM = timeToMins(sleepTime);
  const sM = rawSM < wM ? rawSM + 24 * 60 : rawSM; // handle past-midnight sleep

  // Hard ceiling: don't study past 23:00 regardless of sleep time
  // (or 1 hour before sleep, whichever is earlier)
  const studyCutoff = Math.min(sM - focusDuration - 5, 23 * 60);
  const latestStart = studyCutoff;

  const MIN_SLOT = focusDuration + 15;

  if (!collegeStart || !collegeEnd) {
    if (latestStart - wM >= MIN_SLOT) return [{ startMins: wM, endMins: latestStart }];
    return [];
  }

  const cS = timeToMins(collegeStart);
  const cE = timeToMins(collegeEnd);
  const slots: FreeSlot[] = [];

  // Morning slot: wake → college start
  if (cS - wM >= MIN_SLOT) {
    slots.push({ startMins: wM, endMins: cS });
  }

  // Evening slot: college end → latestStart (sleep ceiling enforced here)
  if (latestStart - cE >= MIN_SLOT) {
    slots.push({ startMins: cE, endMins: latestStart });
  }

  return slots;
}

/**
 * Assign exact start/end times to topics — pure code, zero AI.
 */
function assignTimesToTopics(
  topics: { id: string; title: string }[],
  freeSlots: FreeSlot[],
  focusDuration: number,
  dateStr: string,
  chronotype: string,
): Array<{ title: string; category: string; start_time: string; end_time: string; topic_id: string }> {
  if (topics.length === 0 || freeSlots.length === 0) return [];

  const BREAK = 15;
  const events: ReturnType<typeof assignTimesToTopics> = [];

  // Night owls: back-load into later slots
  const orderedSlots = chronotype === 'NIGHT_OWL'
    ? [...freeSlots].reverse()
    : freeSlots;

  let topicIdx = 0;
  for (const slot of orderedSlots) {
    let cursor = slot.startMins;
    while (topicIdx < topics.length) {
      const blockEnd = cursor + focusDuration;
      if (blockEnd > slot.endMins) break;
      const topic = topics[topicIdx];
      events.push({
        title: `Study: ${topic.title}`,
        category: 'FOCUS',
        start_time: minsToTimeStr(cursor, dateStr),
        end_time: minsToTimeStr(blockEnd, dateStr),
        topic_id: topic.id,
      });
      cursor = blockEnd + BREAK;
      topicIdx++;
    }
    if (topicIdx >= topics.length) break;
  }

  return events;
}

// ─── Lifestyle parser ─────────────────────────────────────────────────────────

const parseLifestyle = (raw: any) => {
  if (!raw) return { activities: [], choresMinutes: 0, socialMinutes: 0 };
  if (Array.isArray(raw)) return { activities: raw, choresMinutes: 30, socialMinutes: 60 };
  return {
    activities: raw.anchors ?? [],
    choresMinutes: raw.chores_errands_mins ?? 30,
    socialMinutes: raw.social_leisure_mins ?? 60,
  };
};

// ─── Main generation ──────────────────────────────────────────────────────────

export async function checkTriggersAndRegenerate(userId: string) {
  // Step 1 — Load profile
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (profileErr || !profile) throw new Error('Could not load user profile.');

  console.log("RAW PROFILE FROM DB:", {
    wake_time: profile.wake_time,
    sleep_time: profile.sleep_time,
    college_start_time: profile.college_start_time,
    college_end_time: profile.college_end_time,
  });

  // Step 2 — Load all topics
  const { data: courses, error: coursesErr } = await supabase
    .from('courses')
    .select(`id, title, units (id, title, topics (id, title, status, last_reviewed))`)
    .eq('user_id', userId);
  if (coursesErr || !courses) throw new Error(`Could not load courses: ${coursesErr?.message}`);

  const allTopics: any[] = [];
  for (const course of courses as any[]) {
    for (const unit of course.units ?? []) {
      allTopics.push(...(unit.topics ?? []));
    }
  }
  const unmasteredTopics = allTopics.filter(t => t.status !== 'mastered');

  // Step 3 — Panic level
  const today = new Date();
  const examDate = profile.next_exam_date
    ? new Date(profile.next_exam_date)
    : new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000);

  const daysLeft = Math.max(1, Math.ceil((examDate.getTime() - today.getTime()) / 86400000));
  const topicsPerDayNeeded = unmasteredTopics.length / daysLeft;

  let panicLevel = 1;
  if (topicsPerDayNeeded >= 4) panicLevel = 5;
  else if (topicsPerDayNeeded >= 3) panicLevel = 4;
  else if (topicsPerDayNeeded >= 2) panicLevel = 3;
  else if (topicsPerDayNeeded >= 1) panicLevel = 2;

  // Step 4 — Sort by priority: decaying → learning → locked
  const sortedTopics = [...unmasteredTopics].sort((a, b) => {
    const order: Record<string, number> = { decaying: 1, learning: 2, locked: 3 };
    return (order[a.status] ?? 4) - (order[b.status] ?? 4);
  });

  // Step 5 — Resolve profile times (null-safe, no hardcoded fallback assumptions)
  const wakeTime      = toHHMM(profile.wake_time)          ?? '07:00';
  const sleepTime     = toHHMM(profile.sleep_time)         ?? '23:00';
  const collegeStart  = toHHMM(profile.college_start_time);
  const collegeEnd    = toHHMM(profile.college_end_time);
  const focusDuration = profile.focus_duration ?? 60;
  const chronotype    = profile.chronotype ?? 'STANDARD';

  console.log('[Scheduler] wake:', wakeTime, '| sleep:', sleepTime,
    '| college:', collegeStart, '→', collegeEnd,
    '| block:', focusDuration, 'min | panic:', panicLevel);

  // Step 6 — Compute free slots (pure code, no Groq)
  const freeSlots = computeFreeSlots(wakeTime, sleepTime, collegeStart, collegeEnd, focusDuration);
  console.log('[Scheduler] Free slots:', freeSlots.map(s =>
    `${Math.floor(s.startMins / 60)}:${String(s.startMins % 60).padStart(2, '0')} → ${Math.floor(s.endMins / 60)}:${String(s.endMins % 60).padStart(2, '0')}`
  ));

  const totalFreeMinutes = freeSlots.reduce((sum, s) => sum + (s.endMins - s.startMins), 0);
  const maxTopicsPerDay = Math.max(1, Math.min(
    Math.floor(totalFreeMinutes / (focusDuration + 15)),
    Math.ceil(topicsPerDayNeeded),
    8
  ));
  console.log('[Scheduler] Max topics/day:', maxTopicsPerDay, '| Free mins:', totalFreeMinutes);

  // Step 7 — Assign exact times per day (pure code, no Groq involved)
  const GENERATE_DAYS = 15;
  const allEvents: any[] = [];
  let topicIndex = 0;

  for (let i = 0; i < GENERATE_DAYS; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    const dateStr = toLocalDateStr(d);

    const count = Math.min(maxTopicsPerDay, sortedTopics.length - topicIndex);
    if (count <= 0) break;

    const todaysTopics = sortedTopics.slice(topicIndex, topicIndex + count);
    topicIndex += count;

    const dayEvents = assignTimesToTopics(todaysTopics, freeSlots, focusDuration, dateStr, chronotype);
    allEvents.push(...dayEvents);
  }

  if (allEvents.length === 0) {
    console.warn('[Scheduler] No events generated. Check free slots and topic count.');
    return { success: true, panicLevel, eventsCount: 0 };
  }

  // Step 8 — Insert to Supabase
  const mappedEvents = allEvents.map(e => ({
    user_id: userId,
    title: e.title,
    category: e.category,
    start_time: e.start_time,
    end_time: e.end_time,
    topic_id: e.topic_id ?? null,
    completed: false,
  }));

  const { error: insertErr } = await supabase.from('schedule_events').insert(mappedEvents);
  if (insertErr) throw new Error('Failed to save schedule: ' + insertErr.message);

  console.log(`[Scheduler] ✅ Inserted ${mappedEvents.length} events for user ${userId}`);
  return { success: true, panicLevel, eventsCount: mappedEvents.length };
}

// ─── End of day check ─────────────────────────────────────────────────────────

export async function checkEndOfDayRegeneration(userId: string) {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
  const endOfDay   = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

  const { data: todaysEvents } = await supabase
    .from('schedule_events')
    .select('*')
    .eq('user_id', userId)
    .eq('category', 'FOCUS')
    .gte('start_time', startOfDay.toISOString())
    .lte('start_time', endOfDay.toISOString());

  if (!todaysEvents || todaysEvents.length === 0) return;

  const completed = todaysEvents.filter(e => e.completed).length;
  if (completed < todaysEvents.length / 2) {
    await supabase
      .from('schedule_events')
      .delete()
      .eq('user_id', userId)
      .eq('completed', false)
      .gte('start_time', endOfDay.toISOString());

    await checkTriggersAndRegenerate(userId);
  }
}

// ─── Mark viva complete ───────────────────────────────────────────────────────

export async function markVivaComplete(
  eventId: string,
  topicId: string | null,
  answerScore: number
) {
  await supabase.from('schedule_events').update({ completed: true }).eq('id', eventId);
  if (!topicId) return;

  if (answerScore >= 7) {
    const { data: topic } = await supabase.from('topics').select('status').eq('id', topicId).single();
    if (topic && topic.status !== 'mastered') {
      const nextStatus = topic.status === 'locked' ? 'learning' : 'mastered';
      await supabase
        .from('topics')
        .update({ status: nextStatus, last_reviewed: new Date().toISOString() })
        .eq('id', topicId);
    }
  }
}