"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Check, Copy, Mail, Pencil, Send, UserPlus, UserRound, Trophy, BookOpen, Flame } from "lucide-react";
import { StatStrip, type StatStripItem } from "@/features/reading/components/StatStrip";
import { Modal } from "@/features/reading/components/Modal";
import { readingAuthApi } from "@/features/reading/authApi";
import { readingSemesterApi } from "@/features/reading/semesterApi";
import { isApiError } from "@/features/auth/utils";
import { useReadingAuthStore } from "@/features/reading/store/useReadingAuthStore";
import type { ReadingTeam } from "@/features/reading/authTypes";
import type { SemesterRound } from "@/features/reading/types";

interface StudentDraft {
  firstName: string;
  lastName: string;
  email: string;
}

const EMPTY_STUDENT: StudentDraft = { firstName: "", lastName: "", email: "" };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

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

const inputBase =
  "h-11 w-full rounded-lg border border-[var(--rd-border)] bg-[var(--rd-ink)] px-3 text-sm text-[var(--rd-text)] placeholder:text-[var(--rd-text-muted)] transition-colors focus:outline-none focus:border-[var(--rd-accent-from)]";

interface StepBadgeProps {
  index: number;
  label: string;
  active: boolean;
  done: boolean;
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

export default function ReadingTeamPage() {
  const { user, updateUser } = useReadingAuthStore();
  const currentStreak = user?.current_streak ?? 0;

  const [team, setTeam] = useState<ReadingTeam | null>(null);
  const [rounds, setRounds] = useState<SemesterRound[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const booksFinished = rounds.filter((r) => r.status === "done").length;
  const activeRound = rounds.find((r) => r.status === "in_progress");

  const statItems: StatStripItem[] = [
    {
      icon: Trophy, label: "Team place",
      value: team ? `${team.place}/${team.teams_total}` : "—",
      note: "Ranked by roster size for now",
      accent: false,
    },
    {
      icon: BookOpen, label: "Books finished",
      value: rounds.length > 0 ? `${booksFinished}/${rounds.length}` : "—",
      note: activeRound ? `${activeRound.label} in progress` : "No active round",
      accent: false,
    },
    {
      icon: Flame, label: "Reading streak",
      value: `${currentStreak} days`,
      note: "+5 pts per 7-day streak",
      accent: true,
    },
  ];

  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState("");
  const [renameError, setRenameError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [addStep, setAddStep] = useState(1);
  const [students, setStudents] = useState<StudentDraft[]>([]);

  const openSpots = team ? team.max_members - team.members.length : 0;
  const totalSteps = Math.max(openSpots, 1) + 1;
  const teamStep = totalSteps;

  // Only read inside the modal's render, which never mounts until a user click
  // (post-hydration) — so there's no SSR/client markup mismatch to worry about.
  const shareSupported = typeof navigator !== "undefined" && "share" in navigator;

  useEffect(() => {
    readingAuthApi
      .myTeam()
      .then((t) => { setTeam(t); setNewName(t.name); })
      .catch((err) => setLoadError(isApiError(err) ? err.detail : "Couldn't load your team."))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    readingAuthApi.me().then(updateUser).catch(() => { /* keep whatever we already have */ });
  }, [updateUser]);

  useEffect(() => {
    readingSemesterApi.listRounds().then(setRounds).catch(() => { /* stat tile shows a dash until it loads */ });
  }, []);

  async function handleRenameSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newName.trim()) return;
    setRenameError(null);
    setIsSaving(true);
    try {
      const updated = await readingAuthApi.renameTeam({ team_name: newName.trim() });
      setTeam(updated);
      setIsRenaming(false);
    } catch (err) {
      setRenameError(isApiError(err) ? err.detail : "Couldn't rename your team.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCopyTeamName() {
    if (!team) return;
    try {
      await navigator.clipboard.writeText(team.name);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch { /* clipboard unavailable — no-op */ }
  }

  async function handleCopyLink() {
    if (!team) return;
    try {
      await navigator.clipboard.writeText(buildInviteLink(team));
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 1600);
    } catch { /* clipboard unavailable — no-op */ }
  }

  async function handleShare() {
    if (!team) return;
    try {
      await navigator.share({
        title: "Join my NATS Spirea team",
        text: `Join my team "${team.name}" on NATS Spirea — register with this link and you'll land straight in our team.`,
        url: buildInviteLink(team),
      });
    } catch { /* user cancelled the share sheet — no-op */ }
  }

  function openAddModal() {
    const spots = team ? Math.max(team.max_members - team.members.length, 1) : 1;
    setStudents(Array.from({ length: spots }, () => ({ ...EMPTY_STUDENT })));
    setAddStep(1);
    setIsAddModalOpen(true);
  }

  function closeAddModal() {
    setIsAddModalOpen(false);
    setAddStep(1);
    setStudents([]);
  }

  function updateStudent(index: number, patch: Partial<StudentDraft>) {
    setStudents((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function handleSendInvites(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!team) return;
    window.location.href = buildInviteMailto(team, students);
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] px-8 py-10 lg:px-12">
      {isLoading ? (
        <p className="text-sm text-[var(--rd-text-muted)]">Loading your team…</p>
      ) : loadError || !team ? (
        <p className="text-sm text-[var(--rd-text-muted)]">{loadError ?? "You haven't joined a team yet."}</p>
      ) : (
        <>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            {isRenaming ? (
              <form onSubmit={handleRenameSubmit} className="flex flex-1 items-center gap-2">
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="h-11 max-w-xs flex-1 rounded-lg border border-[var(--rd-border)] bg-[var(--rd-panel)] px-3 text-xl font-semibold text-[var(--rd-text)] focus:outline-none focus:border-[var(--rd-accent-from)]"
                />
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rd-accent-gradient rounded-lg px-4 py-2 text-sm font-semibold text-black/85 disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => { setIsRenaming(false); setNewName(team.name); setRenameError(null); }}
                  className="rounded-lg border border-[var(--rd-border)] px-4 py-2 text-sm text-[var(--rd-text)]"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-3">
                <h1 className="font-display text-2xl font-semibold text-[var(--rd-text)]">{team.name}</h1>
                <button
                  onClick={() => setIsRenaming(true)}
                  className="text-[var(--rd-text-muted)] transition-colors hover:text-[var(--rd-text)]"
                  aria-label="Rename team"
                >
                  <Pencil size={15} />
                </button>
              </div>
            )}

            {team.members.length < team.max_members && (
              <button
                onClick={openAddModal}
                className="rd-accent-gradient inline-flex items-center gap-2 self-start rounded-lg px-4 py-2 text-sm font-semibold text-black/85 transition-opacity hover:opacity-90"
              >
                <UserPlus size={15} />
                Add students
              </button>
            )}
          </div>
          {renameError && <p className="mt-2 text-sm text-red-400">{renameError}</p>}
          {team && (
            <p className="mt-1 text-sm text-[var(--rd-text-muted)]">
              Place {team.place} of {team.teams_total} this semester
            </p>
          )}

          <div className="mt-6">
            <StatStrip items={statItems} />
          </div>

          <div className="mt-6 rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-7">
            <div className="flex items-center justify-between">
              <p className="text-base font-medium text-[var(--rd-text)]">Roster</p>
              <span className="text-sm text-[var(--rd-text-muted)]">
                {team.members.length}/{team.max_members} players
              </span>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {team.members.map((member) => {
                const isMe = member.id === user?.id;
                return (
                  <div
                    key={member.id}
                    className="flex flex-col gap-4 rounded-xl border border-[var(--rd-border)] bg-[var(--rd-ink)] p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--rd-border)] text-xs font-semibold text-[var(--rd-text)]">
                        {initials(member.full_name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm text-[var(--rd-text)]">
                          {member.full_name} {isMe && <span className="text-[var(--rd-text-muted)]">· you</span>}
                        </p>
                        <p className="truncate text-xs text-[var(--rd-text-muted)]">{member.email}</p>
                      </div>
                    </div>

                    {!isMe && (
                      <div className="flex gap-2">
                        <a
                          href={`mailto:${member.email}`}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--rd-border)] px-3 py-2 text-xs font-medium text-[var(--rd-text)] transition-colors hover:border-[var(--rd-accent-from)]"
                        >
                          <Mail size={13} />
                          Message
                        </a>
                        <Link
                          href={`/reading/team/${member.id}` as Route}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--rd-border)] px-3 py-2 text-xs font-medium text-[var(--rd-text)] transition-colors hover:border-[var(--rd-accent-from)]"
                        >
                          <UserRound size={13} />
                          View profile
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
              {Array.from({ length: team.max_members - team.members.length }).map((_, i) => (
                <button
                  key={`empty-${i}`}
                  onClick={openAddModal}
                  className="group flex items-center gap-3 rounded-xl border border-dashed border-[var(--rd-border)] p-4 text-left transition-colors hover:border-[var(--rd-accent-from)]"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-dashed border-[var(--rd-border)] text-[var(--rd-text-muted)] transition-colors group-hover:border-[var(--rd-accent-from)] group-hover:text-[var(--rd-accent-from)]">
                    <UserPlus size={16} />
                  </span>
                  <p className="text-sm text-[var(--rd-text-muted)] transition-colors group-hover:text-[var(--rd-text)]">
                    Add a student
                  </p>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {isAddModalOpen && team && (
        <Modal title="Add students to your team" onClose={closeAddModal}>
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

          <form onSubmit={handleSendInvites}>
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
                    <p className="text-[11px] uppercase tracking-[0.1em] text-[var(--rd-text-muted)]">
                      Student {i + 1}
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
              </div>
            )}
          </form>
        </Modal>
      )}
    </div>
  );
}
