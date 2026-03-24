package com.example.neurocanopy

import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.SeekBar
import android.widget.TextView
import android.widget.TimePicker
import androidx.appcompat.app.AlertDialog
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

class MainActivity : AppCompatActivity() {

    data class SlotRange(var start: String, var end: String)

    private val weekDays = listOf("M", "T", "W", "T", "F", "S")
    private val stepTitles = listOf(
        "Account",
        "Identity & Cognitive",
        "Bio-Rhythms",
        "Academics",
        "Logistics",
        "Materials & Lifestyle"
    )
    private val stepDescs = listOf(
        "Login details",
        "Who are you?",
        "Daily energy cycles",
        "Schedule & Exams",
        "Living & overhead",
        "Syllabus & anchors"
    )

    private var currentStep = 1
    private var livingStatus = "Hosteler"
    private var energyPattern = "Standard"

    private val subjects = mutableListOf("Maths", "Operating Systems", "Data Structures")
    private val lifestyleAnchors = mutableListOf("Gym")

    private var slots = buildSlotsFromRange("09:00", "16:00", 60).toMutableList()
    private val scheduleGrid = MutableList(weekDays.size) { MutableList<Int?>(slots.size) { null } }

    private lateinit var stepBadge: TextView
    private lateinit var stepTitle: TextView
    private lateinit var stepDesc: TextView
    private lateinit var continueButton: Button
    private lateinit var backButton: Button
    private lateinit var progressRow: LinearLayout

    private lateinit var step1: LinearLayout
    private lateinit var step2: LinearLayout
    private lateinit var step3: LinearLayout
    private lateinit var step4: LinearLayout
    private lateinit var step5: LinearLayout
    private lateinit var step6: LinearLayout

    private lateinit var energyEarlyButton: Button
    private lateinit var energyStandardButton: Button
    private lateinit var energyNightButton: Button

    private lateinit var subjectChips: LinearLayout
    private lateinit var newSubjectInput: EditText
    private lateinit var addSubjectButton: Button

    private lateinit var collegeStartButton: Button
    private lateinit var collegeEndButton: Button
    private lateinit var addSlotButton: Button
    private lateinit var gridHeaderRow: LinearLayout
    private lateinit var slotsContainer: LinearLayout
    private lateinit var slotSummaryText: TextView

    private lateinit var hostelerButton: Button
    private lateinit var dayScholarButton: Button
    private lateinit var commuteSeek: SeekBar
    private lateinit var choresSeek: SeekBar
    private lateinit var socialSeek: SeekBar
    private lateinit var commuteLabel: TextView
    private lateinit var choresLabel: TextView
    private lateinit var socialLabel: TextView

    private lateinit var syllabusList: LinearLayout
    private lateinit var anchorChips: LinearLayout
    private lateinit var customAnchorInput: EditText
    private lateinit var addAnchorButton: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_main)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        bindViews()
        wireEvents()
        renderStep()
        renderProgressRow()
        renderSubjects()
        renderAnchors()
        renderSyllabusRows()
        renderScheduleGrid()
        updateSeekLabels()
        refreshPatternButtons()
        refreshLivingButtons()
    }

    private fun bindViews() {
        stepBadge = findViewById(R.id.stepBadge)
        stepTitle = findViewById(R.id.stepTitle)
        stepDesc = findViewById(R.id.stepDesc)
        continueButton = findViewById(R.id.continueButton)
        backButton = findViewById(R.id.backButton)
        progressRow = findViewById(R.id.progressRow)

        step1 = findViewById(R.id.step1)
        step2 = findViewById(R.id.step2)
        step3 = findViewById(R.id.step3)
        step4 = findViewById(R.id.step4)
        step5 = findViewById(R.id.step5)
        step6 = findViewById(R.id.step6)

        energyEarlyButton = findViewById(R.id.energyEarlyButton)
        energyStandardButton = findViewById(R.id.energyStandardButton)
        energyNightButton = findViewById(R.id.energyNightButton)

        subjectChips = findViewById(R.id.subjectChips)
        newSubjectInput = findViewById(R.id.newSubjectInput)
        addSubjectButton = findViewById(R.id.addSubjectButton)

        collegeStartButton = findViewById(R.id.collegeStartButton)
        collegeEndButton = findViewById(R.id.collegeEndButton)
        addSlotButton = findViewById(R.id.addSlotButton)
        gridHeaderRow = findViewById(R.id.gridHeaderRow)
        slotsContainer = findViewById(R.id.slotsContainer)
        slotSummaryText = findViewById(R.id.slotSummaryText)

        hostelerButton = findViewById(R.id.hostelerButton)
        dayScholarButton = findViewById(R.id.dayScholarButton)
        commuteSeek = findViewById(R.id.commuteSeek)
        choresSeek = findViewById(R.id.choresSeek)
        socialSeek = findViewById(R.id.socialSeek)
        commuteLabel = findViewById(R.id.commuteLabel)
        choresLabel = findViewById(R.id.choresLabel)
        socialLabel = findViewById(R.id.socialLabel)

        syllabusList = findViewById(R.id.syllabusList)
        anchorChips = findViewById(R.id.anchorChips)
        customAnchorInput = findViewById(R.id.customAnchorInput)
        addAnchorButton = findViewById(R.id.addAnchorButton)
    }

    private fun wireEvents() {
        continueButton.setOnClickListener {
            if (currentStep < 6) {
                currentStep += 1
                renderStep()
            } else {
                AlertDialog.Builder(this)
                    .setTitle("Setup Complete")
                    .setMessage("NeuroCanopy profile initialized successfully.")
                    .setPositiveButton("OK", null)
                    .show()
            }
        }

        backButton.setOnClickListener {
            if (currentStep > 1) {
                currentStep -= 1
                renderStep()
            }
        }

        energyEarlyButton.setOnClickListener { energyPattern = "Early Bird"; refreshPatternButtons() }
        energyStandardButton.setOnClickListener { energyPattern = "Standard"; refreshPatternButtons() }
        energyNightButton.setOnClickListener { energyPattern = "Night Owl"; refreshPatternButtons() }

        addSubjectButton.setOnClickListener {
            val next = newSubjectInput.text.toString().trim()
            if (next.isNotEmpty() && !subjects.contains(next)) {
                subjects.add(next)
                newSubjectInput.setText("")
                sanitizeScheduleGrid()
                renderSubjects()
                renderSyllabusRows()
                renderScheduleGrid()
            }
        }

        addAnchorButton.setOnClickListener {
            val next = customAnchorInput.text.toString().trim()
            if (next.isNotEmpty() && !lifestyleAnchors.contains(next)) {
                lifestyleAnchors.add(next)
                customAnchorInput.setText("")
                renderAnchors()
            }
        }

        collegeStartButton.setOnClickListener {
            openTimePicker(collegeStartButton.text.toString()) { picked ->
                val currentEnd24 = displayTo24(collegeEndButton.text.toString())
                val safeEnd = if (toMinutes(picked) >= toMinutes(currentEnd24)) addMinutes(picked, 60) else currentEnd24
                collegeStartButton.text = toDisplayTime(picked)
                collegeEndButton.text = toDisplayTime(safeEnd)
                slots = buildSlotsFromRange(picked, safeEnd, 60).toMutableList()
                syncGridWithSlots(slots.size)
                renderScheduleGrid()
            }
        }

        collegeEndButton.setOnClickListener {
            openTimePicker(collegeEndButton.text.toString()) { picked ->
                val currentStart24 = displayTo24(collegeStartButton.text.toString())
                val safeEnd = if (toMinutes(picked) <= toMinutes(currentStart24)) addMinutes(currentStart24, 60) else picked
                collegeEndButton.text = toDisplayTime(safeEnd)
                slots = buildSlotsFromRange(currentStart24, safeEnd, 60).toMutableList()
                syncGridWithSlots(slots.size)
                renderScheduleGrid()
            }
        }

        addSlotButton.setOnClickListener {
            if (slots.isEmpty()) {
                slots.add(SlotRange("09:00", "10:00"))
            } else {
                val end = slots.last().end
                slots.add(SlotRange(end, addMinutes(end, 60)))
            }
            syncGridWithSlots(slots.size)
            collegeEndButton.text = toDisplayTime(slots.last().end)
            renderScheduleGrid()
        }

        hostelerButton.setOnClickListener {
            livingStatus = "Hosteler"
            refreshLivingButtons()
        }

        dayScholarButton.setOnClickListener {
            livingStatus = "Day Scholar"
            refreshLivingButtons()
        }

        commuteSeek.setOnSeekBarChangeListener(simpleSeekListener { updateSeekLabels() })
        choresSeek.setOnSeekBarChangeListener(simpleSeekListener { updateSeekLabels() })
        socialSeek.setOnSeekBarChangeListener(simpleSeekListener { updateSeekLabels() })
    }

    private fun renderStep() {
        stepBadge.text = String.format("Step %02d / 06", currentStep)
        stepTitle.text = stepTitles[currentStep - 1]
        stepDesc.text = stepDescs[currentStep - 1]

        step1.visibility = if (currentStep == 1) View.VISIBLE else View.GONE
        step2.visibility = if (currentStep == 2) View.VISIBLE else View.GONE
        step3.visibility = if (currentStep == 3) View.VISIBLE else View.GONE
        step4.visibility = if (currentStep == 4) View.VISIBLE else View.GONE
        step5.visibility = if (currentStep == 5) View.VISIBLE else View.GONE
        step6.visibility = if (currentStep == 6) View.VISIBLE else View.GONE

        backButton.visibility = if (currentStep > 1) View.VISIBLE else View.INVISIBLE
        continueButton.text = if (currentStep == 6) "Complete Setup" else "Continue"

        renderProgressRow()
    }

    private fun renderProgressRow() {
        progressRow.removeAllViews()
        repeat(6) { idx ->
            val bar = View(this)
            val params = LinearLayout.LayoutParams(0, dp(8), 1f)
            if (idx > 0) params.marginStart = dp(4)
            bar.layoutParams = params
            bar.setBackgroundColor(
                ContextCompat.getColor(
                    this,
                    if (idx < currentStep) R.color.nc_primary else R.color.nc_break
                )
            )
            progressRow.addView(bar)
        }
    }

    private fun refreshPatternButtons() {
        setPatternButtonState(energyEarlyButton, energyPattern == "Early Bird")
        setPatternButtonState(energyStandardButton, energyPattern == "Standard")
        setPatternButtonState(energyNightButton, energyPattern == "Night Owl")
    }

    private fun setPatternButtonState(button: Button, selected: Boolean) {
        button.setBackgroundResource(if (selected) R.drawable.bg_brutal_primary else R.drawable.bg_brutal_input)
    }

    private fun refreshLivingButtons() {
        hostelerButton.setBackgroundResource(if (livingStatus == "Hosteler") R.drawable.bg_brutal_primary else R.drawable.bg_brutal_input)
        dayScholarButton.setBackgroundResource(if (livingStatus == "Day Scholar") R.drawable.bg_brutal_primary else R.drawable.bg_brutal_input)
        commuteLabel.visibility = if (livingStatus == "Day Scholar") View.VISIBLE else View.GONE
        commuteSeek.visibility = if (livingStatus == "Day Scholar") View.VISIBLE else View.GONE
    }

    private fun updateSeekLabels() {
        val commuteMinutes = 10 + commuteSeek.progress
        commuteLabel.text = "Commute: $commuteMinutes min"
        choresLabel.text = "Chores: ${choresSeek.progress} min"
        socialLabel.text = "Social: ${socialSeek.progress} min"
    }

    private fun renderSubjects() {
        subjectChips.removeAllViews()
        subjects.forEach { subject ->
            val chip = Button(this)
            chip.text = "$subject x"
            chip.textSize = 11f
            chip.setTextColor(ContextCompat.getColor(this, R.color.black))
            chip.setAllCaps(false)
            chip.minHeight = dp(34)
            chip.setBackgroundResource(R.drawable.bg_chip_subject)
            chip.setOnClickListener {
                subjects.remove(subject)
                sanitizeScheduleGrid()
                renderSubjects()
                renderSyllabusRows()
                renderScheduleGrid()
            }
            val lp = LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT)
            lp.marginEnd = dp(8)
            chip.layoutParams = lp
            subjectChips.addView(chip)
        }
    }

    private fun renderAnchors() {
        anchorChips.removeAllViews()
        val anchorList = (listOf("Gym", "Sports", "Music", "Gaming", "Socializing") + lifestyleAnchors)
            .distinct()

        anchorList.forEach { anchor ->
            val chip = Button(this)
            chip.text = anchor
            chip.textSize = 11f
            chip.setAllCaps(false)
            chip.minHeight = dp(36)
            val active = lifestyleAnchors.contains(anchor)
            chip.setBackgroundResource(if (active) R.drawable.bg_brutal_accent else R.drawable.bg_brutal_input)
            chip.setTextColor(ContextCompat.getColor(this, if (active) android.R.color.white else R.color.black))
            chip.setOnClickListener {
                if (lifestyleAnchors.contains(anchor)) lifestyleAnchors.remove(anchor) else lifestyleAnchors.add(anchor)
                renderAnchors()
            }
            val lp = LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT)
            lp.marginEnd = dp(8)
            chip.layoutParams = lp
            anchorChips.addView(chip)
        }
    }

    private fun renderSyllabusRows() {
        syllabusList.removeAllViews()
        subjects.forEach { subject ->
            val row = LinearLayout(this)
            row.orientation = LinearLayout.HORIZONTAL
            row.setPadding(dp(10), dp(10), dp(10), dp(10))
            row.setBackgroundResource(R.drawable.bg_brutal_input)

            val title = TextView(this)
            title.text = subject
            title.textSize = 14f
            title.setTypeface(null, android.graphics.Typeface.BOLD)
            val titleLp = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
            title.layoutParams = titleLp

            val action = TextView(this)
            action.text = "Upload PDF"
            action.setPadding(dp(8), dp(4), dp(8), dp(4))
            action.setBackgroundResource(R.drawable.bg_brutal_black)
            action.setTextColor(ContextCompat.getColor(this, android.R.color.white))
            action.textSize = 11f

            row.addView(title)
            row.addView(action)

            val lp = LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT)
            lp.bottomMargin = dp(8)
            row.layoutParams = lp
            syllabusList.addView(row)
        }
    }

    private fun renderScheduleGrid() {
        gridHeaderRow.removeAllViews()
        slotsContainer.removeAllViews()

        gridHeaderRow.addView(makeGridCell("", dp(148), isHeader = true))
        weekDays.forEach { day ->
            gridHeaderRow.addView(makeGridCell(day, dp(84), isHeader = true))
        }
        gridHeaderRow.addView(makeGridCell("", dp(42), isHeader = true))

        slots.forEachIndexed { slotIndex, slot ->
            val row = LinearLayout(this)
            row.orientation = LinearLayout.HORIZONTAL
            row.layoutParams = LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT)

            val timeWrap = LinearLayout(this)
            timeWrap.orientation = LinearLayout.HORIZONTAL
            timeWrap.layoutParams = LinearLayout.LayoutParams(dp(148), LinearLayout.LayoutParams.WRAP_CONTENT)

            val startBtn = makeTimeButton(slot.start) {
                openTimePicker(slot.start) { picked ->
                    applySlotBoundaryChange(slotIndex, true, picked)
                }
            }
            val endBtn = makeTimeButton(slot.end) {
                openTimePicker(slot.end) { picked ->
                    applySlotBoundaryChange(slotIndex, false, picked)
                }
            }

            timeWrap.addView(startBtn)
            timeWrap.addView(makeMidDash())
            timeWrap.addView(endBtn)
            row.addView(timeWrap)

            weekDays.forEachIndexed { dayIndex, _ ->
                val value = scheduleGrid[dayIndex][slotIndex]
                val label = getCellLabel(value)
                val cell = Button(this)
                cell.layoutParams = LinearLayout.LayoutParams(dp(84), dp(42))
                (cell.layoutParams as LinearLayout.LayoutParams).marginStart = dp(2)
                cell.text = label
                cell.textSize = 10f
                cell.setAllCaps(false)
                cell.setBackgroundResource(
                    when {
                        value == -1 -> R.drawable.bg_brutal_secondary
                        label.isNotEmpty() -> R.drawable.bg_brutal_primary
                        else -> R.drawable.bg_slot_cell
                    }
                )
                cell.setOnClickListener {
                    handleCellCycle(dayIndex, slotIndex)
                    renderScheduleGrid()
                }
                row.addView(cell)
            }

            val remove = Button(this)
            remove.layoutParams = LinearLayout.LayoutParams(dp(42), dp(42))
            (remove.layoutParams as LinearLayout.LayoutParams).marginStart = dp(2)
            remove.text = "x"
            remove.textSize = 12f
            remove.setAllCaps(false)
            remove.setBackgroundResource(R.drawable.bg_brutal_accent)
            remove.setTextColor(ContextCompat.getColor(this, android.R.color.white))
            remove.visibility = if (slots.size > 1) View.VISIBLE else View.INVISIBLE
            remove.setOnClickListener {
                removeSlotAt(slotIndex)
                renderScheduleGrid()
            }
            row.addView(remove)

            val rowLp = LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT)
            rowLp.topMargin = dp(4)
            row.layoutParams = rowLp
            slotsContainer.addView(row)
        }

        slotSummaryText.text = "Total slots: ${slots.size} | Tap cells to cycle subjects and break"
    }

    private fun applySlotBoundaryChange(slotIndex: Int, isStart: Boolean, newValue: String) {
        if (slotIndex !in slots.indices) return
        val updated = slots.map { SlotRange(it.start, it.end) }.toMutableList()
        val futureDurations = updated.drop(slotIndex + 1).map { (toMinutes(it.end) - toMinutes(it.start)).coerceAtLeast(15) }

        if (isStart) {
            updated[slotIndex].start = newValue
            if (slotIndex > 0) updated[slotIndex - 1].end = newValue
            if (toMinutes(updated[slotIndex].end) <= toMinutes(updated[slotIndex].start)) {
                updated[slotIndex].end = addMinutes(updated[slotIndex].start, 60)
            }
        } else {
            updated[slotIndex].end = newValue
            if (toMinutes(updated[slotIndex].end) <= toMinutes(updated[slotIndex].start)) {
                updated[slotIndex].end = addMinutes(updated[slotIndex].start, 15)
            }
        }

        var cursor = toMinutes(updated[slotIndex].end)
        for (i in (slotIndex + 1) until updated.size) {
            val duration = futureDurations.getOrElse(i - slotIndex - 1) { 60 }
            updated[i].start = toTimeString(cursor)
            updated[i].end = toTimeString(cursor + duration)
            cursor += duration
        }

        slots = updated
        if (slots.isNotEmpty()) {
            collegeStartButton.text = toDisplayTime(slots.first().start)
            collegeEndButton.text = toDisplayTime(slots.last().end)
        }
    }

    private fun removeSlotAt(slotIndex: Int) {
        if (slots.size <= 1 || slotIndex !in slots.indices) return
        slots.removeAt(slotIndex)
        weekDays.indices.forEach { day ->
            if (slotIndex < scheduleGrid[day].size) scheduleGrid[day].removeAt(slotIndex)
        }
        if (slots.isNotEmpty()) {
            collegeStartButton.text = toDisplayTime(slots.first().start)
            collegeEndButton.text = toDisplayTime(slots.last().end)
        }
    }

    private fun handleCellCycle(dayIndex: Int, slotIndex: Int) {
        val current = scheduleGrid[dayIndex][slotIndex]
        val next = when {
            subjects.isEmpty() -> if (current == -1) null else -1
            current == null -> 0
            current == -1 -> 0
            current < subjects.lastIndex -> current + 1
            else -> -1
        }
        scheduleGrid[dayIndex][slotIndex] = next
    }

    private fun getCellLabel(value: Int?): String {
        return when {
            value == null -> ""
            value == -1 -> "Break"
            value in subjects.indices -> subjects[value]
            else -> ""
        }
    }

    private fun sanitizeScheduleGrid() {
        weekDays.indices.forEach { d ->
            scheduleGrid[d].indices.forEach { s ->
                val v = scheduleGrid[d][s]
                if (v != null && v >= 0 && v >= subjects.size) scheduleGrid[d][s] = null
            }
        }
    }

    private fun syncGridWithSlots(nextSlotCount: Int) {
        weekDays.indices.forEach { dayIndex ->
            val day = scheduleGrid[dayIndex]
            while (day.size < nextSlotCount) day.add(null)
            while (day.size > nextSlotCount) day.removeAt(day.lastIndex)
        }
    }

    private fun makeGridCell(text: String, width: Int, isHeader: Boolean): TextView {
        val tv = TextView(this)
        tv.layoutParams = LinearLayout.LayoutParams(width, dp(32))
        if (isHeader) {
            tv.setBackgroundResource(R.drawable.bg_brutal_black)
            tv.setTextColor(ContextCompat.getColor(this, android.R.color.white))
            tv.setTypeface(null, android.graphics.Typeface.BOLD)
            tv.textSize = 12f
        } else {
            tv.setBackgroundResource(R.drawable.bg_slot_cell)
            tv.setTextColor(ContextCompat.getColor(this, R.color.black))
            tv.textSize = 10f
        }
        tv.text = text
        tv.textAlignment = View.TEXT_ALIGNMENT_CENTER
        tv.gravity = android.view.Gravity.CENTER
        if (tv.layoutParams is LinearLayout.LayoutParams) {
            val lp = tv.layoutParams as LinearLayout.LayoutParams
            lp.marginStart = dp(2)
        }
        return tv
    }

    private fun makeTimeButton(value24: String, onClick: () -> Unit): Button {
        val b = Button(this)
        b.layoutParams = LinearLayout.LayoutParams(0, dp(42), 1f)
        b.text = toDisplayTime(value24)
        b.textSize = 10f
        b.setAllCaps(false)
        b.minHeight = dp(42)
        b.setPadding(dp(4), 0, dp(4), 0)
        b.setBackgroundResource(R.drawable.bg_brutal_input)
        b.setOnClickListener { onClick() }
        return b
    }

    private fun makeMidDash(): TextView {
        val dash = TextView(this)
        val lp = LinearLayout.LayoutParams(dp(10), dp(42))
        lp.marginStart = dp(2)
        lp.marginEnd = dp(2)
        dash.layoutParams = lp
        dash.text = "-"
        dash.textAlignment = View.TEXT_ALIGNMENT_CENTER
        dash.gravity = android.view.Gravity.CENTER
        return dash
    }

    private fun openTimePicker(initialDisplay: String, onPicked24: (String) -> Unit) {
        val seed24 = displayTo24(initialDisplay)
        val parts = seed24.split(":")
        val h = parts[0].toIntOrNull() ?: 9
        val m = parts[1].toIntOrNull() ?: 0

        val picker = TimePicker(this)
        picker.setIs24HourView(false)
        picker.hour = h
        picker.minute = m

        AlertDialog.Builder(this)
            .setTitle("Select time")
            .setView(picker)
            .setPositiveButton("OK") { _, _ ->
                val selected = toTimeString((picker.hour * 60) + picker.minute)
                onPicked24(selected)
                renderScheduleGrid()
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun toMinutes(time: String): Int {
        val parts = time.split(":")
        val h = parts.getOrNull(0)?.toIntOrNull() ?: 0
        val m = parts.getOrNull(1)?.toIntOrNull() ?: 0
        return h * 60 + m
    }

    private fun toTimeString(minutes: Int): String {
        val safe = minutes.coerceIn(0, 1439)
        val h = safe / 60
        val m = safe % 60
        return String.format("%02d:%02d", h, m)
    }

    private fun addMinutes(time: String, delta: Int): String = toTimeString(toMinutes(time) + delta)

    private fun buildSlotsFromRange(start: String, end: String, chunkMinutes: Int): List<SlotRange> {
        val startMins = toMinutes(start)
        val endMins = toMinutes(end)
        if (endMins <= startMins) {
            return listOf(SlotRange(start, addMinutes(start, chunkMinutes)))
        }

        val result = mutableListOf<SlotRange>()
        var cursor = startMins
        while (cursor < endMins) {
            val next = minOf(cursor + chunkMinutes, endMins)
            result.add(SlotRange(toTimeString(cursor), toTimeString(next)))
            cursor = next
        }
        return result
    }

    private fun toDisplayTime(time24: String): String {
        val parts = time24.split(":")
        var h = parts.getOrNull(0)?.toIntOrNull() ?: 0
        val m = parts.getOrNull(1)?.toIntOrNull() ?: 0
        val suffix = if (h >= 12) "PM" else "AM"
        if (h == 0) h = 12
        if (h > 12) h -= 12
        return String.format("%02d:%02d %s", h, m, suffix)
    }

    private fun displayTo24(display: String): String {
        if (!display.contains(" ")) return display
        val parts = display.split(" ")
        val hm = parts[0].split(":")
        var h = hm.getOrNull(0)?.toIntOrNull() ?: 0
        val m = hm.getOrNull(1)?.toIntOrNull() ?: 0
        val suffix = parts.getOrNull(1)?.uppercase() ?: "AM"
        if (suffix == "AM" && h == 12) h = 0
        if (suffix == "PM" && h < 12) h += 12
        return String.format("%02d:%02d", h, m)
    }

    private fun simpleSeekListener(onChanged: () -> Unit): SeekBar.OnSeekBarChangeListener {
        return object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) = onChanged()
            override fun onStartTrackingTouch(seekBar: SeekBar?) {}
            override fun onStopTrackingTouch(seekBar: SeekBar?) {}
        }
    }

    private fun dp(value: Int): Int = (value * resources.displayMetrics.density).toInt()
}