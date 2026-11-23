// Turns the live numbers from GET /api/dashboard/stats into the charts
// shown on the dashboard and in presentation mode.

export const REPORT_TITLE = 'Regular Employees Wellbeing Report'

export interface ChartDef {
  id: string
  title: string
  type: 'pie' | 'bar'
  labels: string[]
  values?: number[]
  series?: { name: string; values: number[] }[]
  stacked?: boolean
  distributed?: boolean
  showPercent?: boolean
  colors?: string[]
  note?: string
}

export interface Stat { label: string; value: number; color?: string }

export interface Section {
  id: string
  title: string
  icon: string
  stats?: Stat[]
  charts: ChartDef[]
}

type AgeGroups = Record<string, number>

// Shape of the response from GET /api/dashboard/stats
export interface WellbeingStats {
  year: number
  available_years: number[]
  summary: {
    total_regular: number
    divisions: { code: string; name: string; count: number }[]
  }
  philpen: {
    total: number
    coverage_by_division: Record<string, { assessed: number; not_assessed: number }>
    family_history: { yes: number; no: number }
    tobacco: { current: number; former_or_never: number; second_hand: number }
    alcohol: { heavy: number; occasional_or_none: number }
    physical_activity: { active: number; inactive: number }
    nutrition: { high_fat_salt_sugar: number; no: number }
    needs_counselling: number
    burnout: { fine: number; be_careful: number; candidate: number; burning_out: number }
    hypertension: { with: number; without: number; by_age_group: AgeGroups }
    blood_pressure: { normal: number; elevated: number; stage1: number; stage2: number; severe: number; not_recorded: number }
  }
  ame: {
    total: number
    coverage: { with_ame: number; without_ame: number }
    by_division: Record<string, { with_ame: number; without_ame: number }>
    sex: { male: number; female: number }
    diabetes: { with: number; normal: number; by_age_group: AgeGroups }
    cholesterol: { high: number; normal: number; by_age_group: AgeGroups }
    lipid_profile: { cholesterol: number; triglyceride: number; hdl: number; ldl: number }
  }
  completion: {
    philpen_total: number
    ame_total: number
    complete: number
    philpen_only: number
    ame_only: number
  }
}

const RISK = '#e53935'
const OK = '#12a58a'
const BLUE = '#0a7ea4'
const AMBER = '#f9a825'
const ORANGE = '#fb8c00'
const PINK = '#ec407a'
const DARK_RED = '#8e0000'

export function buildSummary(stats: WellbeingStats) {
  return {
    year: stats.year,
    title: REPORT_TITLE,
    totalRegular: stats.summary.total_regular,
    divisions: stats.summary.divisions,
  }
}

export function buildSections(stats: WellbeingStats): Section[] {
  const { philpen, ame, completion } = stats
  const divisionCodes = stats.summary.divisions.map(d => d.code)

  return [
    {
      id: 'assessment',
      title: 'PhilPEN Risk Assessment & Mental Health Assessment',
      icon: 'mdi-clipboard-pulse-outline',
      charts: [
        {
          id: 'coverage-by-division',
          title: 'Assessment Coverage by Division',
          type: 'bar',
          stacked: true,
          labels: divisionCodes,
          series: [
            {
              name: 'Assessed',
              values: divisionCodes.map(c => philpen.coverage_by_division[c]?.assessed ?? 0),
            },
            {
              name: 'Not yet assessed',
              values: divisionCodes.map(c => philpen.coverage_by_division[c]?.not_assessed ?? 0),
            },
          ],
          colors: [BLUE, RISK],
          note: 'Not yet assessed = division headcount minus recorded assessments.',
        },
        {
          id: 'family-history',
          title: 'Family History',
          type: 'pie',
          labels: ['Yes', 'No'],
          values: [philpen.family_history.yes, philpen.family_history.no],
          colors: [RISK, BLUE],
        },
        {
          id: 'tobacco',
          title: 'Tobacco Use',
          type: 'pie',
          labels: ['Former / non-smoker', 'Current user'],
          values: [philpen.tobacco.former_or_never, philpen.tobacco.current],
          colors: [BLUE, RISK],
          note: `${philpen.tobacco.second_hand} employees are exposed to second-hand smoking.`,
        },
        {
          id: 'alcohol',
          title: 'Alcohol Consumption',
          type: 'pie',
          labels: ['Occasional / non-drinker', 'Heavy drinker'],
          values: [philpen.alcohol.occasional_or_none, philpen.alcohol.heavy],
          colors: [BLUE, RISK],
        },
        {
          id: 'physical-activity',
          title: 'Physical Activity',
          type: 'pie',
          labels: ['Active', 'Inactive'],
          values: [philpen.physical_activity.active, philpen.physical_activity.inactive],
          colors: [BLUE, RISK],
        },
        {
          id: 'nutrition',
          title: 'Nutrition & Dietary Assessment',
          type: 'pie',
          labels: ['High fat, salt, sugar', 'No'],
          values: [philpen.nutrition.high_fat_salt_sugar, philpen.nutrition.no],
          colors: [RISK, BLUE],
        },
      ],
    },
    {
      id: 'mental-health',
      title: 'Mental Health Assessment',
      icon: 'mdi-brain',
      stats: [{ label: 'Needs counselling (SRQ)', value: philpen.needs_counselling, color: RISK }],
      charts: [
        {
          id: 'burnout',
          title: 'Burn Out Test',
          type: 'bar',
          distributed: true,
          labels: ['Fine', 'Be careful', 'Candidate', 'Burning out'],
          values: [
            philpen.burnout.fine,
            philpen.burnout.be_careful,
            philpen.burnout.candidate,
            philpen.burnout.burning_out,
          ],
          colors: [OK, AMBER, ORANGE, RISK],
        },
      ],
    },
    {
      id: 'blood-pressure',
      title: 'Blood Pressure',
      icon: 'mdi-heart-pulse',
      stats: [
        {
          label: 'Employees with BP recorded',
          value:
      philpen.blood_pressure.normal
      + philpen.blood_pressure.elevated
      + philpen.blood_pressure.stage1
      + philpen.blood_pressure.stage2
      + philpen.blood_pressure.severe,
          color: BLUE,
        },
        {
          label: 'Hypertensive (Stage 1 or higher)',
          value: philpen.blood_pressure.stage1 + philpen.blood_pressure.stage2 + philpen.blood_pressure.severe,
          color: RISK,
        },
      ],
      charts: [
        {
          id: 'blood-pressure',
          title: 'Blood Pressure Category',
          type: 'bar',
          distributed: true,
          labels: ['Normal', 'Elevated', 'Stage 1', 'Stage 2', 'Severe / Crisis'],
          values: [
            philpen.blood_pressure.normal,
            philpen.blood_pressure.elevated,
            philpen.blood_pressure.stage1,
            philpen.blood_pressure.stage2,
            philpen.blood_pressure.severe,
          ],
          colors: [OK, AMBER, ORANGE, RISK, DARK_RED],
          note: 'Based on the average of the 2nd and 3rd readings of the PhilPEN assessment.',
        },
        {
          id: 'blood-pressure-risk',
          title: 'Blood pressure risk level',
          type: 'pie',
          showPercent: true,
          labels: ['Normal (low risk)', 'At risk (Elevated)', 'High risk (Stage 1 or higher)'],
          values: [
            philpen.blood_pressure.normal,
            philpen.blood_pressure.elevated,
            philpen.blood_pressure.stage1 + philpen.blood_pressure.stage2 + philpen.blood_pressure.severe,
          ],
          colors: [OK, AMBER, RISK],
          note: 'Percentage is based on employees with a recorded BP. Employees with no BP recorded are not counted.',
        },
      ],
    },
    {
      id: 'ame',
      title: 'Annual Medical Exam',
      icon: 'mdi-stethoscope',
      stats: [{ label: 'Exams recorded', value: ame.total, color: BLUE }],
      charts: [
        {
          id: 'ame-coverage',
          title: 'Annual Medical Exam Coverage',
          type: 'pie',
          labels: ['With AME', 'Without AME'],
          values: [ame.coverage.with_ame, ame.coverage.without_ame],
          colors: [BLUE, RISK],
          note: 'Without AME = total regular employees minus recorded exams.',
        },
        {
          id: 'ame-by-division',
          title: 'Annual Medical Exam by Division',
          type: 'bar',
          stacked: true,
          labels: divisionCodes,
          series: [
            {
              name: 'With AME',
              values: divisionCodes.map(c => ame.by_division[c]?.with_ame ?? 0),
            },
            {
              name: 'Without AME',
              values: divisionCodes.map(c => ame.by_division[c]?.without_ame ?? 0),
            },
          ],
          colors: [BLUE, RISK],
        },
        {
          id: 'ame-sex',
          title: 'Consolidated Data by Sex',
          type: 'pie',
          labels: ['Male', 'Female'],
          values: [ame.sex.male, ame.sex.female],
          colors: [BLUE, PINK],
        },
      ],
    },
    {
      id: 'lab-findings',
      title: `Laboratory Findings (${ame.total} employees)`,
      icon: 'mdi-test-tube',
      charts: [
        {
          id: 'dm',
          title: 'Diabetes Mellitus (based on HbA1c)',
          type: 'pie',
          labels: ['With DM', 'Normal result'],
          values: [ame.diabetes.with, ame.diabetes.normal],
          colors: [RISK, BLUE],
        },
        {
          id: 'dm-age',
          title: 'Diabetes Mellitus by Age Group',
          type: 'bar',
          labels: Object.keys(ame.diabetes.by_age_group),
          values: Object.values(ame.diabetes.by_age_group),
          colors: [RISK],
        },
        {
          id: 'cholesterol',
          title: 'Hyperdyslipidemia (total cholesterol)',
          type: 'pie',
          labels: ['With high cholesterol', 'Normal result'],
          values: [ame.cholesterol.high, ame.cholesterol.normal],
          colors: [RISK, BLUE],
        },
        {
          id: 'cholesterol-age',
          title: 'Hyperdyslipidemia by Age Group',
          type: 'bar',
          labels: Object.keys(ame.cholesterol.by_age_group),
          values: Object.values(ame.cholesterol.by_age_group),
          colors: [RISK],
        },
        {
          id: 'lipid-profile',
          title: 'Lipid Profile (abnormal results)',
          type: 'bar',
          labels: ['Cholesterol', 'Triglyceride', 'HDL', 'LDL'],
          values: [
            ame.lipid_profile.cholesterol,
            ame.lipid_profile.triglyceride,
            ame.lipid_profile.hdl,
            ame.lipid_profile.ldl,
          ],
          colors: [BLUE],
        },
        {
          id: 'hypertension',
          title: 'Hypertension',
          type: 'pie',
          labels: ['With hypertension', 'Without hypertension'],
          values: [philpen.hypertension.with, philpen.hypertension.without],
          colors: [RISK, BLUE],
          note: 'Based on the PhilPEN assessment (Yes or on medication).',
        },
        {
          id: 'hypertension-age',
          title: 'Hypertension by Age Group',
          type: 'bar',
          labels: Object.keys(philpen.hypertension.by_age_group),
          values: Object.values(philpen.hypertension.by_age_group),
          colors: [RISK],
        },
      ],
    },
    {
      id: 'completion',
      title: 'Overall Completion',
      icon: 'mdi-check-decagram-outline',
      charts: [
        {
          id: 'completion-comparison',
          title: 'PhilPEN Assessment vs Annual Medical Exam',
          type: 'bar',
          distributed: true,
          labels: ['PhilPEN assessed', 'Medical exam done'],
          values: [completion.philpen_total, completion.ame_total],
          colors: [BLUE, OK],
          note: 'Medical exam counts completed exams only.',
        },
        {
          id: 'completion-overlap',
          title: 'Who Has Completed What',
          type: 'bar',
          distributed: true,
          labels: ['Complete (both)', 'Assessment only', 'Medical exam only'],
          values: [completion.complete, completion.philpen_only, completion.ame_only],
          colors: [OK, AMBER, BLUE],
          note: 'Counted per employee for the selected year.',
        },
      ],
    },
  ]
}
