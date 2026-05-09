const banned = [
  "fuck","shit","bitch","asshole","cunt","dick","pussy","cock","nigger","nigga","faggot","fag","retard","slut","whore","bastard","wank","twat","piss","damn","hell","admin","administrator","autocode","mod","moderator","support","owner","root","system"
];

export function isCleanDisplayName(name: string): { ok: true } | { ok: false; reason: string } {
  const trimmed = name.trim();
  if (trimmed.length < 2) return { ok: false, reason: "Display name is too short." };
  if (trimmed.length > 40) return { ok: false, reason: "Display name is too long." };
  if (!/^[a-zA-Z0-9 _.\-]+$/.test(trimmed)) return { ok: false, reason: "Only letters, numbers, spaces, _ . - allowed." };
  const lower = trimmed.toLowerCase().replace(/[^a-z]/g, "");
  for (const word of banned) {
    if (lower.includes(word)) return { ok: false, reason: "Please choose a respectful display name." };
  }
  return { ok: true };
}
