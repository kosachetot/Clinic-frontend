// Turns the live numbers from GET /api/dashboard/stats into the charts
// shown on the dashboard and in presentation mode.

export const REPORT_TITLE = 'Regular Employees Wellbeing Report'

export type ChartDef = {
  id: string
  title: string
  type: 'pie' | 'bar'
  labels: string[]
  values?: number[]
  series?: { name: string; values: number[] }[]
  stacked?: boolean
  distributed?: boolean
  colors?: string[]
  note?: string
}

export type Stat = { label: string; value: number; color?: string }

export type Section = {
  id: string
  title: string
  icon: string
  stats?: Stat[]
  charts: ChartDef[]
}

type AgeGroups = Record<string, number>

// Shape of the response from GET /api/dashboard/stats
export type WellbeingStats = {
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
  completion: { complete: number; either_only: number }
}

const RISK = '#e53935'
const OK = '#12a58a'
const BLUE = '#0a7ea4'
const AMBER = '#f9a825'
const ORANGE = '#fb8c00'
const PINK = '#ec407a'

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
          title: 'Assessment coverage by division',
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
          title: 'Family history',
          type: 'pie',
          labels: ['Yes', 'No'],
          values: [philpen.family_history.yes, philpen.family_history.no],
          colors: [RISK, BLUE],
        },
        {
          id: 'tobacco',
          title: 'Tobacco use',
          type: 'pie',
          labels: ['Former / non-smoker', 'Current user'],
          values: [philpen.tobacco.former_or_never, philpen.tobacco.current],
          colors: [BLUE, RISK],
          note: `${philpen.tobacco.second_hand} employees are exposed to second-hand smoking.`,
        },
        {
          id: 'alcohol',
          title: 'Alcohol consumption',
          type: 'pie',
          labels: ['Occasional / non-drinker', 'Heavy drinker'],
          values: [philpen.alcohol.occasional_or_none, philpen.alcohol.heavy],
          colors: [BLUE, RISK],
        },
        {
          id: 'physical-activity',
          title: 'Physical activity',
          type: 'pie',
          labels: ['Active', 'Inactive'],
          values: [philpen.physical_activity.active, philpen.physical_activity.inactive],
          colors: [BLUE, RISK],
        },
        {
          id: 'nutrition',
          title: 'Nutrition & dietary assessment',
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
          title: 'Burn out test',
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
      id: 'ame',
      title: 'Annual Medical Exam',
      icon: 'mdi-stethoscope',
      stats: [{ label: 'Exams recorded', value: ame.total, color: BLUE }],
      charts: [
        {
          id: 'ame-coverage',
          title: 'Annual medical exam coverage',
          type: 'pie',
          labels: ['With AME', 'Without AME'],
          values: [ame.coverage.with_ame, ame.coverage.without_ame],
          colors: [BLUE, RISK],
          note: 'Without AME = total regular employees minus recorded exams.',
        },
        {
          id: 'ame-by-division',
          title: 'Annual medical exam by division',
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
          title: 'Consolidated data by sex',
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
          title: 'Diabetes mellitus (based on HbA1c)',
          type: 'pie',
          labels: ['With DM', 'Normal result'],
          values: [ame.diabetes.with, ame.diabetes.normal],
          colors: [RISK, BLUE],
        },
        {
          id: 'dm-age',
          title: 'Diabetes mellitus by age group',
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
          title: 'Hyperdyslipidemia by age group',
          type: 'bar',
          labels: Object.keys(ame.cholesterol.by_age_group),
          values: Object.values(ame.cholesterol.by_age_group),
          colors: [RISK],
        },
        {
          id: 'lipid-profile',
          title: 'Lipid profile (abnormal results)',
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
          title: 'Hypertension by age group',
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
          id: 'completion',
          title: 'PhilPEN, MH assessment, and annual medical exam',
          type: 'bar',
          distributed: true,
          labels: ['Complete (both)', 'Either PhilPEN/MH or AME only'],
          values: [completion.complete, completion.either_only],
          colors: [OK, AMBER],
        },
      ],
    },
  ]
}
