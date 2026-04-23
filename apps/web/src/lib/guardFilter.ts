export type GuardResult = {
  blocked: boolean;
  reason?: string;
};

const BLOCKED_PATTERNS: RegExp[] = [
  // CSAM
  /child.{0,15}(porn|pornograph|sex(ual)?\s+content|nude|naked).{0,15}(minor|child|kid|underage)/i,
  /\b(csam|child sexual abuse material)\b/i,

  // Bioweapons / chemical weapons
  /\b(synthesize|synthesis|produce|manufacture|create).{0,40}(sarin|vx\s*gas|mustard\s*gas|nerve\s*agent|ricin|botulinum\s*toxin|anthrax\s*spore)/i,
  /\b(bioweapon|biological\s+weapon|weaponized\s+pathogen|weaponized\s+virus)\b/i,

  // Nuclear / radiological weapons
  /\b(dirty\s+bomb|radiological\s+weapon|nuclear\s+device).{0,30}(build|make|construct|assemble|instructions?)/i,
  /\bhow\s+to\s+(build|make|construct).{0,30}(nuclear\s+bomb|dirty\s+bomb)\b/i,

  // Mass-casualty IEDs (specific construction requests only)
  /\bhow\s+to\s+(build|make|assemble|construct|wire).{0,30}(ied|improvised\s+explosive|suicide\s+bomb|pipe\s+bomb)\b/i,
];

const BLOCK_MESSAGE = "This request cannot be processed.";

export function guardFilter(prompt: string): GuardResult {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(prompt)) {
      return { blocked: true, reason: BLOCK_MESSAGE };
    }
  }
  return { blocked: false };
}
