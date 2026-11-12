// Field definitions for the PhilPEN and Annual Medical Exam forms.
// The generic list page and form dialog are built from these configs.

export const YES_NO = [
  { title: 'Yes', value: 'yes' },
  { title: 'No', value: 'no' },
]

const YES_NO_IDK_MEDS = [
  { title: 'Yes', value: 'yes' },
  { title: 'No', value: 'no' },
  { title: 'I don\'t know', value: 'idk' },
  { title: 'On medication', value: 'meds' },
]

const SEX = [
  { title: 'Male', value: 'male' },
  { title: 'Female', value: 'female' },
]

const TOBACCO = [
  { title: 'Current user', value: 'current' },
  { title: 'Former user', value: 'former' },
  { title: 'Never used', value: 'never' },
]

const ALCOHOL = [
  { title: 'Heavy drinker', value: 'heavy' },
  { title: 'Occasional drinker', value: 'occasional' },
  { title: 'Non-drinker', value: 'none' },
]

const BMI = [
  { title: 'Underweight', value: 'underweight' },
  { title: 'Normal', value: 'normal' },
  { title: 'Overweight', value: 'overweight' },
  { title: 'Obese', value: 'obese' },
]

const BURNOUT = [
  { title: 'Fine', value: 'fine' },
  { title: 'Be careful', value: 'be_careful' },
  { title: 'Candidate', value: 'candidate' },
  { title: 'Burning out', value: 'burning_out' },
]

export type FieldType = 'text' | 'number' | 'date' | 'select' | 'bool' | 'textarea' | 'employee' | 'division'

export type FieldDef = {
  key: string
  label: string
  type: FieldType
  items?: (string | { title: string; value: string })[]
  required?: boolean
  md?: number
  step?: number
}

// Shape returned by GET /api/employees
export type Employee = {
  emp_id: number
  name: string
  designation: string | null
  division_id: number | null
  division: string | null
  sex: 'male' | 'female' | null
  age: number | null
}

export type FieldGroup = {
  title: string
  note?: string
  fields: FieldDef[]
}

export type RecordsConfig = {
  title: string
  subtitle: string
  singular: string
  endpoint: string
  dateField: string
  extraColumns: { title: string; key: string }[]
  groups: FieldGroup[]
}

export const todayLocal = () => new Date().toLocaleDateString('en-CA')

const EMPLOYEE_NOTE = 'Search by name or employee no. and pick a regular employee. The details fill in automatically and can still be edited.'

export const philpenConfig: RecordsConfig = {
  title: 'PhilPEN Risk Assessment & Mental Health Assessment',
  subtitle: 'One assessment per employee per year',
  singular: 'assessment',
  endpoint: '/philpen-assessments',
  dateField: 'assessed_at',
  extraColumns: [
    { title: 'Sex', key: 'sex' },
    { title: 'Age', key: 'age' },
  ],
  groups: [
    {
      title: 'Employee',
      note: EMPLOYEE_NOTE,
      fields: [
        { key: 'emp_id', label: 'Employee no.', type: 'employee', required: true, md: 4 },
        { key: 'employee_name', label: 'Name', type: 'employee', required: true, md: 8 },
        { key: 'designation', label: 'Designation', type: 'text' },
        { key: 'division_id', label: 'Division', type: 'division' },
        { key: 'assessed_at', label: 'Date of assessment', type: 'date', required: true },
        { key: 'sex', label: 'Sex', type: 'select', items: SEX, required: true },
        { key: 'age', label: 'Age', type: 'number', required: true },
      ],
    },
    {
      title: 'History and risk factors',
      fields: [
        { key: 'hx_ha_stroke_ckd', label: 'History of HA, stroke, CKP', type: 'bool' },
        { key: 'family_history', label: 'Family history', type: 'bool' },
        { key: 'hypertension', label: 'Hypertension', type: 'select', items: YES_NO_IDK_MEDS },
        { key: 'diabetes', label: 'Diabetes mellitus', type: 'select', items: YES_NO_IDK_MEDS },
        { key: 'high_cholesterol', label: 'High cholesterol', type: 'select', items: YES_NO_IDK_MEDS },
      ],
    },
    {
      title: 'Lifestyle',
      fields: [
        { key: 'tobacco_use', label: 'Tobacco use', type: 'select', items: TOBACCO },
        { key: 'second_hand_smoke', label: 'Exposed to second-hand smoke', type: 'bool' },
        { key: 'alcohol_intake', label: 'Alcohol intake', type: 'select', items: ALCOHOL },
        { key: 'physically_active', label: 'Physically active', type: 'bool' },
        { key: 'fruit_veg_intake', label: 'Fruit and vegetable intake', type: 'bool' },
        { key: 'high_fat_salt_sugar', label: 'High fat, salt, sugar diet', type: 'bool' },
      ],
    },
    {
      title: 'Measurements',
      fields: [
        { key: 'bmi_status', label: 'BMI status', type: 'select', items: BMI },
        { key: 'waist_cm', label: 'Waist circumference (cm)', type: 'number', step: 0.1 },
      ],
    },
    {
      title: 'Mental health',
      fields: [
        { key: 'srq_score', label: 'SRQ score', type: 'number' },
        { key: 'needs_counselling', label: 'Needs counselling', type: 'bool' },
        { key: 'burnout_score', label: 'Burn out test score', type: 'number' },
        { key: 'burnout_category', label: 'Burn out category', type: 'select', items: BURNOUT },
      ],
    },
    {
      title: 'Remarks',
      fields: [
        { key: 'remarks', label: 'Remarks', type: 'textarea', md: 12 },
      ],
    },
  ],
}

export const ameConfig: RecordsConfig = {
  title: 'Annual Medical Exam',
  subtitle: 'One exam record per employee per year',
  singular: 'annual medical exam',
  endpoint: '/annual-medical-exams',
  dateField: 'exam_date',
  extraColumns: [
    { title: 'Age', key: 'age' },
    { title: 'HbA1c', key: 'hba1c' },
    { title: 'Cholesterol', key: 'cholesterol' },
  ],
  groups: [
    {
      title: 'Employee',
      note: EMPLOYEE_NOTE,
      fields: [
        { key: 'emp_id', label: 'Employee no.', type: 'employee', required: true, md: 4 },
        { key: 'employee_name', label: 'Name', type: 'employee', required: true, md: 8 },
        { key: 'designation', label: 'Designation', type: 'text' },
        { key: 'division_id', label: 'Division', type: 'division' },
        { key: 'sex', label: 'Sex', type: 'select', items: SEX },
        { key: 'age', label: 'Age', type: 'number', required: true },
        { key: 'exam_date', label: 'Date', type: 'date', required: true },
      ],
    },
    {
      title: 'Laboratory results',
      fields: [
        { key: 'glucose', label: 'Glucose (4.1 - 5.9 mmol/L)', type: 'number', step: 0.01 },
        { key: 'hba1c', label: 'HbA1c (4.0 - 6.5 %)', type: 'number', step: 0.01 },
        { key: 'cholesterol', label: 'Cholesterol (< 5.2 mmol/L)', type: 'number', step: 0.01 },
        { key: 'triglyceride', label: 'Triglyceride (< 1.7 mmol/L)', type: 'number', step: 0.01 },
        { key: 'hdl', label: 'HDL (> 1.55 mmol/L)', type: 'number', step: 0.01 },
        { key: 'ldl', label: 'LDL (< 2.6 mmol/L)', type: 'number', step: 0.01 },
      ],
    },
    {
      title: 'X-ray',
      fields: [
        { key: 'xray_normal', label: 'X-ray result is normal', type: 'bool', md: 4 },
        { key: 'xray_others', label: 'Other findings', type: 'text', md: 8 },
      ],
    },
    {
      title: 'Remarks',
      fields: [
        { key: 'remarks', label: 'Remarks', type: 'textarea', md: 12 },
      ],
    },
  ],
}
