// Static data taken from the "Regular Employees Wellbeing Report 2025" deck.
// Values marked "verify" were read from chart images, not from slide text.
// Later this file will be replaced by data from the Laravel API.

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

const RISK = '#e53935'
const OK = '#12a58a'
const BLUE = '#0a7ea4'
const AMBER = '#f9a825'
const ORANGE = '#fb8c00'

const AGE_GROUPS = ['18-29', '30-39', '40-49', '50-60', '60 up']

export const summary = {
  year: 2025,
  title: 'Regular Employees Wellbeing Report',
  totalRegular: 128,
  divisions: [
    { code: 'MSD', name: 'Management Support Division', count: 46 },
    { code: 'LHSD', name: 'Local Health Support Division', count: 45 },
    { code: 'RLED', name: 'Regulatory, Licensing, and Enforcement Division', count: 17 },
    { code: 'PDOHO', name: 'Provincial DOH Office', count: 20 },
  ],
}

export const sections: Section[] = [
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
        labels: ['MSD', 'LHSD', 'RLED'],
        series: [
          { name: 'Assessed', values: [38, 28, 14] },
          { name: 'Not yet assessed', values: [8, 17, 3] },
        ],
        colors: [BLUE, RISK],
        note: '108 employees (excludes PDOHO). Meaning of the two colors is based on the deck legend; verify.',
      },
      {
        id: 'family-history',
        title: 'Family history',
        type: 'pie',
        labels: ['Yes', 'No'],
        values: [70, 10],
        colors: [RISK, BLUE],
      },
      {
        id: 'tobacco',
        title: 'Tobacco use',
        type: 'pie',
        labels: ['Former / non-smoker', 'Current user'],
        values: [72, 8],
        colors: [BLUE, RISK],
        note: '11 employees are exposed to second-hand smoking.',
      },
      {
        id: 'alcohol',
        title: 'Alcohol consumption',
        type: 'pie',
        labels: ['Occasional / non-drinker', 'Heavy drinker'],
        values: [63, 17],
        colors: [BLUE, RISK],
      },
      {
        id: 'physical-activity',
        title: 'Physical activity',
        type: 'pie',
        labels: ['Active', 'Inactive'],
        values: [30, 50],
        colors: [BLUE, RISK],
      },
      {
        id: 'nutrition',
        title: 'Nutrition & dietary assessment',
        type: 'pie',
        labels: ['High fat, salt, sugar', 'No'],
        values: [60, 20],
        colors: [RISK, BLUE],
      },
    ],
  },
  {
    id: 'mental-health',
    title: 'Mental Health Assessment',
    icon: 'mdi-brain',
    stats: [{ label: 'Needs counselling (SRQ)', value: 16, color: RISK }],
    charts: [
      {
        id: 'burnout',
        title: 'Burn out test',
        type: 'bar',
        distributed: true,
        labels: ['Fine', 'Be careful', 'Candidate', 'Burning out'],
        values: [55, 12, 12, 1], // verify
        colors: [OK, AMBER, ORANGE, RISK],
      },
    ],
  },
  {
    id: 'ame',
    title: 'Annual Medical Exam',
    icon: 'mdi-stethoscope',
    stats: [
      { label: 'PDOHO employees', value: 20, color: BLUE },
      { label: 'PDOHO with AME', value: 7, color: OK },
      { label: 'PDOHO without AME', value: 14, color: RISK },
    ],
    charts: [
      {
        id: 'ame-coverage',
        title: 'Annual medical exam coverage',
        type: 'pie',
        labels: ['With AME', 'Without AME'],
        values: [89, 19],
        colors: [BLUE, RISK],
        note: '108 employees (excludes PDOHO). Meaning of the two colors is based on the deck legend; verify.',
      },
      {
        id: 'ame-sex',
        title: 'Consolidated data by sex',
        type: 'pie',
        labels: ['Male', 'Female'],
        values: [24, 59], // female = 83 - 24, verify
        colors: [BLUE, '#ec407a'],
        note: '83 employees including PDOHOs.',
      },
    ],
  },
  {
    id: 'lab-findings',
    title: 'Laboratory Findings (83 employees)',
    icon: 'mdi-test-tube',
    charts: [
      {
        id: 'dm',
        title: 'Diabetes mellitus (based on HbA1c)',
        type: 'pie',
        labels: ['With DM', 'Normal result'],
        values: [19, 64],
        colors: [RISK, BLUE],
      },
      {
        id: 'dm-age',
        title: 'Diabetes mellitus by age group',
        type: 'bar',
        labels: AGE_GROUPS,
        values: [0, 2, 5, 6, 6],
        colors: [RISK],
      },
      {
        id: 'cholesterol',
        title: 'Hyperdyslipidemia (total cholesterol)',
        type: 'pie',
        labels: ['With high cholesterol', 'Normal result'],
        values: [50, 33],
        colors: [RISK, BLUE],
      },
      {
        id: 'cholesterol-age',
        title: 'Hyperdyslipidemia by age group',
        type: 'bar',
        labels: AGE_GROUPS,
        values: [0, 18, 15, 15, 2],
        colors: [RISK],
      },
      {
        id: 'lipid-profile',
        title: 'Lipid profile (abnormal results)',
        type: 'bar',
        labels: ['Cholesterol', 'Triglyceride', 'HDL', 'LDL'],
        values: [50, 33, 22, 67], // verify
        colors: [BLUE],
      },
      {
        id: 'hypertension',
        title: 'Hypertension',
        type: 'pie',
        labels: ['With hypertension', 'Without hypertension'],
        values: [24, 60],
        colors: [RISK, BLUE],
        note: 'The deck totals 84 here but 83 elsewhere; verify.',
      },
      {
        id: 'hypertension-age',
        title: 'Hypertension by age group',
        type: 'bar',
        labels: AGE_GROUPS,
        values: [0, 2, 5, 9, 8],
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
        labels: ['Complete (all three)', 'Either PhilPEN/MH or AME only'],
        values: [73, 35],
        colors: [OK, AMBER],
      },
    ],
  },
]
