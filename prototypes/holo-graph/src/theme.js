// Soft pastel palette and friendly glyphs for each resource type.

export const TYPE_STYLE = {
  internet: { color: '#8ec5ff', emoji: '🌐', label: 'Internet', shape: 'globe', size: 0.75 },
  endpoint: { color: '#7fe3d4', emoji: '🔗', label: 'Application endpoint', shape: 'gem', size: 0.36 },
  ec2: { color: '#b9a4ff', emoji: '🖥️', label: 'EC2 instance', shape: 'box', size: 0.6 },
  lambda: { color: '#d3b8ff', emoji: 'λ', label: 'Lambda function', shape: 'cone', size: 0.5 },
  technology: { color: '#ffe08a', emoji: '🧩', label: 'Hosted technology', shape: 'dodeca', size: 0.32, labelRight: true },
  iam_role: { color: '#ffc29e', emoji: '🔑', label: 'IAM role', shape: 'torus', size: 0.46 },
  iam_user: { color: '#ffd1b0', emoji: '👤', label: 'IAM user', shape: 'torus', size: 0.42 },
  s3: { color: '#9be8b5', emoji: '🪣', label: 'S3 bucket', shape: 'bucket', size: 0.5 },
  vulnerability: { color: '#ffa3c4', emoji: '🐞', label: 'Vulnerability', shape: 'octa', size: 0.3, labelRight: true },
  secret: { color: '#ffcf70', emoji: '🗝️', label: 'Secret', shape: 'tetra', size: 0.32, labelRight: true },
}

export const SEVERITY_STYLE = {
  critical: { bg: '#ffd6d6', fg: '#b4234a', label: 'Critical' },
  high: { bg: '#ffe4c7', fg: '#b45309', label: 'High' },
  medium: { bg: '#fff3b8', fg: '#8a6a00', label: 'Medium' },
  low: { bg: '#d6f5e3', fg: '#16794a', label: 'Low' },
}

// Warm rose-gold used to light up an attack path.
export const PATH_COLOR = '#ff8fa3'
export const PATH_GLOW = '#ffb38a'
