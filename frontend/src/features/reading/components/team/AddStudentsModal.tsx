"use client";

import { Fragment, useState } from "react";
import { Check, Copy, Send, UserPlus } from "lucide-react";
import { Modal } from "@/features/reading/components/Modal";
import { readingAuthApi } from "@/features/reading/authApi";
import { isApiError } from "@/features/auth/utils";
import { TEAM_INVITE_LINK_ENABLED } from "@/features/reading/teamInviteFeature";
import type { ReadingTeam } from "@/features/reading/authTypes";

interface StudentDraft {
  firstName: string;
  lastName:  string;
  email:     string;
}

const EMPTY_STUDENT: StudentDraft = { firstName: "", lastName: "", email: "" };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputBase =
  "h-11 w-full rounded-lg border border-[var(--rd-border)] bg-[var(--rd-ink)] px-3 text-sm text-[var(--rd-text)] placeholder:text-[var(--rd-text-muted)] transition-colors focus:outline-none focus:border-[var(--rd-accent-from)]";

function isStudentValid(student: StudentDraft): boolean {
  return student.firstName.trim().length > 0 && student.lastName.trim().length > 0 && EMAIL_PATTERN.test(student.email.trim());
}

function buildInviteLink(team: ReadingTeam): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/reading/register?team=${encodeURIComponent(team.name)}`;
}

function buildInviteMailto(team: ReadingTeam, students: StudentDraft[]): string {
  const valid = students.filter(isStudentValid);
  const to = valid.map((s) => encodeURIComponent(s.email.trim())).join(",");
  const names = valid.map((s) => `${s.firstName.trim()} ${s.lastName.trim()}`.trim());
  const greeting =
    names.length === 0
      ? "Hi,"
      : names.length === 1
        ? `Hi ${names[0]},`
        : `Hi ${names.slice(0, -1).join(", ")} and ${names[names.length - 1]},`;
  const subject = `Join "${team.name}" on NATS Spirea`;
  const body = `${greeting}\n\nJoin my team "${team.name}" on NATS Spirea — register through this link and you'll land straight in our team, no extra steps:\n${buildInviteLink(team)}`;
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

interface StepBadgeProps {
  index:  number;
  label:  string;
  active: boolean;
  done:   boolean;
}

function StepBadge({ index, label, active, done }: StepBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
          active
            ? "rd-accent-gradient text-black/85"
            : done
              ? "border border-[var(--rd-accent-from)] text-[var(--rd-accent-from)]"
              : "border border-[var(--rd-border)] text-[var(--rd-text-muted)]"
        }`}
      >
        {done ? <Check size={13} /> : index}
      </span>
      <span className={`hidden text-xs font-medium sm:inline ${active ? "text-[var(--rd-text)]" : "text-[var(--rd-text-muted)]"}`}>
        {label}
      </span>
    </div>
  );
}

interface AddStudentsModalProps {
  team:          ReadingTeam;
  onClose:       () => void;
  onTeamUpdated: (team: ReadingTeam) => void;
}

export function AddStudentsModal({ team, onClose, onTeamUpdated }: AddStudentsModalProps) {
  // Fixed when the modal opens: the roster shrinks the open-spot count as each student is
  // added, and the step layout mustn't reflow underneath an in-flight submission.
  const [openSpots] = useState(() => Math.max(team.max_members - team.members.length, 1));
  const [students, setStudents] = useState<StudentDraft[]>(() =>
    Array.from({ length: openSpots }, () => ({ ...EMPTY_STUDENT }))
  );
  const [addStep, setAddStep] = useState(1);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isAddingDirectly, setIsAddingDirectly] = useState(false);
  const [addDirectlyError, setAddDirectlyError] = useState<string | null>(null);
  const [addedIndexes, setAddedIndexes] = useState<ReadonlySet<number>>(new Set());

  const totalSteps = openSpots + 1;
  const teamStep = totalSteps;

  // This component only mounts after a user click (post-hydration), so reading navigator here
  // can't cause an SSR/client markup mismatch.
  const shareSupported = typeof navigator !== "undefined" && "share" in navigator;

  function updateStudent(index: number, patch: Partial<StudentDraft>) {
    setStudents((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  async function handleCopyTeamName() {
    try {
      await navigator.clipboard.writeText(team.name);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch { /* clipboard unavailable — no-op */ }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(buildInviteLink(team));
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 1600);
    } catch { /* clipboard unavailable — no-op */ }
  }

  async function handleShare() {
    try {
      await navigator.share({
        title: "Join my NATS Spirea team",
        text: `Join my team "${team.name}" on NATS Spirea — register with this link and you'll land straight in our team.`,
        url: buildInviteLink(team),
      });
    } catch { /* user cancelled the share sheet — no-op */ }
  }

  function handleSendInvites(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    window.location.href = buildInviteMailto(team, students);
  }

  async function handleAddDirectly(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAddDirectlyError(null);
    setIsAddingDirectly(true);
    try {
      for (const [index, student] of students.entries()) {
        if (addedIndexes.has(index) || !isStudentValid(student)) continue;
        const updatedTeam = await readingAuthApi.addTeamMember({
          full_name: `${student.firstName.trim()} ${student.lastName.trim()}`.trim(),
          email: student.email.trim(),
        });
        onTeamUpdated(updatedTeam);
        setAddedIndexes((prev) => new Set(prev).add(index));
      }
      onClose();
    } catch (err) {
      setAddDirectlyError(isApiError(err) ? err.detail : "Couldn't add that student.");
    } finally {
      setIsAddingDirectly(false);
    }
  }

  return (
    <Modal title="Add students to your team" onClose={onClose}>
      <div className="mb-5 flex items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const stepNum = i + 1;
          const label = stepNum === teamStep ? "Team" : totalSteps > 2 ? `Student ${stepNum}` : "Student";
          return (
            <Fragment key={stepNum}>
              {i > 0 && (
                <div className={`h-px flex-1 ${addStep >= stepNum ? "bg-[var(--rd-accent-from)]" : "bg-[var(--rd-border)]"}`} />
              )}
              <StepBadge index={stepNum} label={label} active={addStep === stepNum} done={addStep > stepNum} />
            </Fragment>
          );
        })}
      </div>

      <form onSubmit={TEAM_INVITE_LINK_ENABLED ? handleSendInvites : handleAddDirectly}>
        {students.map((student, i) => {
          const stepNum = i + 1;
          if (addStep !== stepNum) return null;
          return (
            <div key={i} className="flex flex-col gap-3">
              <p className="text-sm leading-relaxed text-[var(--rd-text-muted)]">
                {totalSteps > 2 ? `Who's the ${stepNum === 1 ? "first" : "second"} student?` : "Who are you inviting?"}{" "}
                We&apos;ll use this to personalize the invite.
              </p>

              <div className="flex gap-3">
                <div className="flex flex-1 flex-col gap-1.5">
                  <label htmlFor={`student-${i}-first-name`} className="text-xs text-[var(--rd-text-muted)]">
                    First name
                  </label>
                  <input
                    id={`student-${i}-first-name`}
                    value={student.firstName}
                    onChange={(e) => updateStudent(i, { firstName: e.target.value })}
                    placeholder="Aisha"
                    autoComplete="given-name"
                    className={inputBase}
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1.5">
                  <label htmlFor={`student-${i}-last-name`} className="text-xs text-[var(--rd-text-muted)]">
                    Last name
                  </label>
                  <input
                    id={`student-${i}-last-name`}
                    value={student.lastName}
                    onChange={(e) => updateStudent(i, { lastName: e.target.value })}
                    placeholder="Nurlanovna"
                    autoComplete="family-name"
                    className={inputBase}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor={`student-${i}-email`} className="text-xs text-[var(--rd-text-muted)]">
                  Email
                </label>
                <input
                  id={`student-${i}-email`}
                  type="email"
                  value={student.email}
                  onChange={(e) => updateStudent(i, { email: e.target.value })}
                  placeholder="student@example.com"
                  autoComplete="email"
                  className={inputBase}
                />
              </div>

              <div className="mt-1 flex gap-2">
                {stepNum > 1 && (
                  <button
                    type="button"
                    onClick={() => setAddStep(stepNum - 1)}
                    className="flex-1 rounded-xl border border-[var(--rd-border)] px-4 py-3 text-sm font-medium text-[var(--rd-text)] transition-colors hover:border-[var(--rd-accent-from)]"
                  >
                    Back
                  </button>
                )}
                <button
                  type="button"
                  disabled={!isStudentValid(student)}
                  onClick={() => setAddStep(stepNum + 1)}
                  className="rd-accent-gradient flex flex-[2] items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-black/85 transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  {stepNum < openSpots ? "Next student" : "Next: team"}
                </button>
              </div>
            </div>
          );
        })}

        {addStep === teamStep && (
          <div className="flex flex-col gap-3">
            {students.map((student, i) => (
              <div key={i} className="rounded-xl border border-[var(--rd-border)] px-4 py-3">
                <p className="flex items-center justify-between text-[11px] uppercase tracking-[0.1em] text-[var(--rd-text-muted)]">
                  Student {i + 1}
                  {addedIndexes.has(i) && (
                    <span className="inline-flex items-center gap-1 normal-case tracking-normal text-emerald-400">
                      <Check size={12} /> Added
                    </span>
                  )}
                </p>
                <p className="mt-1 text-sm text-[var(--rd-text)]">{student.firstName} {student.lastName}</p>
                <p className="text-sm text-[var(--rd-text-muted)]">{student.email}</p>
              </div>
            ))}

            <div className="rounded-xl border border-[var(--rd-border)] bg-[var(--rd-ink)] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.1em] text-[var(--rd-text-muted)]">
                Joining team
              </p>
              <p className="mt-1 font-display text-base font-semibold text-[var(--rd-text)]">{team.name}</p>
            </div>

            {TEAM_INVITE_LINK_ENABLED ? (
              <>
                <div className="mt-1 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAddStep(teamStep - 1)}
                    className="flex-1 rounded-xl border border-[var(--rd-border)] px-4 py-3 text-sm font-medium text-[var(--rd-text)] transition-colors hover:border-[var(--rd-accent-from)]"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="rd-accent-gradient flex flex-[2] items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-black/85 transition-opacity hover:opacity-90"
                  >
                    <Send size={16} />
                    Send {students.length > 1 ? "invites" : "invite"}
                  </button>
                </div>
                <p className="text-center text-[11px] text-[var(--rd-text-muted)]">
                  Opens your email app with the invite pre-written.
                </p>

                <div className="mt-3 border-t border-[var(--rd-border)] pt-4">
                  <p className="text-[11px] uppercase tracking-[0.1em] text-[var(--rd-text-muted)]">
                    Or share the invite link yourself
                  </p>
                  <div className="mt-2 flex items-center gap-2 rounded-xl border border-[var(--rd-border)] bg-[var(--rd-ink)] px-4 py-3">
                    <input
                      readOnly
                      value={buildInviteLink(team)}
                      onFocus={(e) => e.currentTarget.select()}
                      className="min-w-0 flex-1 truncate bg-transparent text-sm text-[var(--rd-text)] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[var(--rd-border)] px-3 py-1.5 text-xs font-medium text-[var(--rd-text)] transition-colors hover:border-[var(--rd-accent-from)]"
                    >
                      {linkCopied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      {linkCopied ? "Copied" : "Copy"}
                    </button>
                  </div>

                  {shareSupported && (
                    <button
                      type="button"
                      onClick={handleShare}
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--rd-border)] px-4 py-2.5 text-sm font-medium text-[var(--rd-text)] transition-colors hover:border-[var(--rd-accent-from)]"
                    >
                      <Send size={14} />
                      Share via apps
                    </button>
                  )}
                </div>

                <div className="border-t border-[var(--rd-border)] pt-4">
                  <p className="text-[11px] uppercase tracking-[0.1em] text-[var(--rd-text-muted)]">
                    Or have them join with your team name
                  </p>
                  <div className="mt-2 flex items-center gap-2 rounded-xl border border-[var(--rd-border)] bg-[var(--rd-ink)] px-4 py-3">
                    <span className="flex-1 truncate font-display text-sm font-semibold text-[var(--rd-text)]">
                      {team.name}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyTeamName}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[var(--rd-border)] px-3 py-1.5 text-xs font-medium text-[var(--rd-text)] transition-colors hover:border-[var(--rd-accent-from)]"
                    >
                      {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="mt-1 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAddStep(teamStep - 1)}
                    disabled={isAddingDirectly}
                    className="flex-1 rounded-xl border border-[var(--rd-border)] px-4 py-3 text-sm font-medium text-[var(--rd-text)] transition-colors hover:border-[var(--rd-accent-from)] disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isAddingDirectly}
                    className="rd-accent-gradient flex flex-[2] items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-black/85 transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    <UserPlus size={16} />
                    {isAddingDirectly ? "Adding…" : students.length > 1 ? "Add them to the team" : "Add to the team"}
                  </button>
                </div>
                {addDirectlyError && <p className="text-center text-[11px] text-red-400">{addDirectlyError}</p>}
                <p className="text-center text-[11px] text-[var(--rd-text-muted)]">
                  Test version — this adds them straight to the roster. Invite links are
                  coming in a later update.
                </p>
              </>
            )}
          </div>
        )}
      </form>
    </Modal>
  );
}
