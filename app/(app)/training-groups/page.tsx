"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import {
  type AthleteRow,
  type TrainingGroupInvite,
  type TrainingGroupWithMembers,
  acceptTrainingGroupInvite,
  addTrainingGroupMember,
  createTrainingGroup,
  deleteTrainingGroup,
  declineTrainingGroupInvite,
  getPendingTrainingGroupInvites,
  getTrainingGroupsForUser,
  leaveTrainingGroup,
  removeTrainingGroupMember,
  searchUsers,
} from "@/lib/supabase/training-modules";

const formatUser = (user: AthleteRow) => `${user.name} (${user.email})`;

const removeUserById = (users: AthleteRow[], id: string) =>
  users.filter((candidate) => candidate.id !== id);

const getGroupRoleForUser = (
  group: TrainingGroupWithMembers,
  userId: string,
): "headCoach" | "assistantCoach" | "athlete" | null => {
  if (group.headCoach.id === userId) return "headCoach";
  if (group.assistantCoaches.some((coach) => coach.id === userId)) return "assistantCoach";
  if (group.athletes.some((athlete) => athlete.id === userId)) return "athlete";
  return null;
};

const memberRoleLabels: Record<"assistantCoach" | "athlete", string> = {
  assistantCoach: "Assisterande coach",
  athlete: "Atlet",
};

type GroupManagementProps = {
  group: TrainingGroupWithMembers;
  onRefresh: () => Promise<void>;
  onError: (message: string) => void;
  onNotice: (message: string) => void;
  setIsUpdatingMembership: (value: boolean) => void;
  isUpdatingMembership: boolean;
};

const GroupManagementPanel = ({
  group,
  onRefresh,
  onError,
  onNotice,
  setIsUpdatingMembership,
  isUpdatingMembership,
}: GroupManagementProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [memberRole, setMemberRole] = useState<"assistantCoach" | "athlete">("athlete");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<AthleteRow[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const existingMemberIds = useMemo(() => {
    const ids = new Set<string>([group.headCoach.id]);
    group.assistantCoaches.forEach((coach) => ids.add(coach.id));
    group.athletes.forEach((athlete) => ids.add(athlete.id));
    return ids;
  }, [group]);

  const handleSearch = async () => {
    setIsSearching(true);
    onError("");
    try {
      const results = await searchUsers(
        searchTerm,
        memberRole === "assistantCoach" ? "coach" : "athlete",
      );
      setSearchResults(results.filter((user) => !existingMemberIds.has(user.id)));
    } catch (searchError) {
      onError(searchError instanceof Error ? searchError.message : String(searchError));
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddMember = async (member: AthleteRow) => {
    setIsUpdatingMembership(true);
    onError("");
    try {
      await addTrainingGroupMember(group.id, memberRole, member.id);
      setSearchResults((current) => current.filter((candidate) => candidate.id !== member.id));
      await onRefresh();
      onNotice(
        memberRole === "assistantCoach"
          ? "Inbjudan skickad till coachen."
          : "Inbjudan skickad till atleten.",
      );
    } catch (addError) {
      onError(addError instanceof Error ? addError.message : String(addError));
    } finally {
      setIsUpdatingMembership(false);
    }
  };

  const handleRemoveMember = async (member: AthleteRow, role: "assistantCoach" | "athlete") => {
    if (!confirm(`Är du säker på att du vill ta bort ${member.name} från gruppen?`)) {
      return;
    }

    setIsUpdatingMembership(true);
    onError("");
    try {
      await removeTrainingGroupMember(group.id, role, member.id);
      await onRefresh();
      onNotice("Medlemmen togs bort från gruppen.");
    } catch (removeError) {
      onError(removeError instanceof Error ? removeError.message : String(removeError));
    } finally {
      setIsUpdatingMembership(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!confirm(`Radera gruppen "${group.name}"? Detta går inte att ångra.`)) {
      return;
    }

    setIsUpdatingMembership(true);
    onError("");
    try {
      await deleteTrainingGroup(group.id);
      await onRefresh();
      onNotice("Gruppen raderades.");
    } catch (deleteError) {
      onError(deleteError instanceof Error ? deleteError.message : String(deleteError));
    } finally {
      setIsUpdatingMembership(false);
    }
  };

  return (
    <div className="mt-4 border-t border-base-300 pt-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-base-content/60">
          Hantera grupp
        </p>
        <button
          type="button"
          className="btn btn-ghost btn-xs"
          onClick={() => setIsExpanded((current) => !current)}
        >
          {isExpanded ? "Dölj" : "Visa"}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3 flex flex-col gap-4">
          <div className="rounded-lg border border-base-300 bg-base-100 p-3">
            <p className="text-sm font-semibold">Lägg till deltagare</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(["athlete", "assistantCoach"] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  className={`btn btn-xs ${memberRole === role ? "btn-primary" : "btn-outline"}`}
                  onClick={() => setMemberRole(role)}
                >
                  {memberRoleLabels[role]}
                </button>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                type="search"
                className="input input-bordered flex-1"
                placeholder={`Sök ${memberRole === "assistantCoach" ? "coacher" : "atleter"}`}
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
              <button
                className="btn btn-secondary"
                type="button"
                onClick={handleSearch}
                disabled={isSearching}
              >
                {isSearching ? "Söker..." : "Sök"}
              </button>
            </div>
            {searchResults.length > 0 && (
              <div className="mt-3 flex flex-col gap-2">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-base-300 bg-base-200 p-2"
                  >
                    <div className="min-w-0 flex-1 text-sm">
                      <p className="truncate font-semibold">{result.name}</p>
                      <p className="truncate text-xs text-base-content/70">{result.email}</p>
                    </div>
                    <button
                      className="btn btn-outline btn-xs shrink-0"
                      type="button"
                      onClick={() => handleAddMember(result)}
                      disabled={isUpdatingMembership}
                    >
                      Bjud in
                    </button>
                  </div>
                ))}
              </div>
            )}
            {searchResults.length === 0 && searchTerm.trim().length > 0 && !isSearching && (
              <p className="mt-2 text-xs text-base-content/60">Inga matchningar hittades.</p>
            )}
          </div>

          <div className="rounded-lg border border-base-300 bg-base-100 p-3">
            <p className="text-sm font-semibold">Assisterande coacher</p>
            {group.assistantCoaches.length === 0 ? (
              <p className="mt-1 text-xs text-base-content/60">Inga assisterande coacher ännu.</p>
            ) : (
              <div className="mt-2 flex flex-col gap-2">
                {group.assistantCoaches.map((coach) => (
                  <div key={coach.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="min-w-0 flex-1 truncate">{coach.name}</span>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs shrink-0"
                      onClick={() => handleRemoveMember(coach, "assistantCoach")}
                      disabled={isUpdatingMembership}
                    >
                      Ta bort
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-base-300 bg-base-100 p-3">
            <p className="text-sm font-semibold">Atleter</p>
            {group.athletes.length === 0 ? (
              <p className="mt-1 text-xs text-base-content/60">Inga atleter ännu.</p>
            ) : (
              <div className="mt-2 flex flex-col gap-2">
                {group.athletes.map((athlete) => (
                  <div key={athlete.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="min-w-0 flex-1 truncate">{athlete.name}</span>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs shrink-0"
                      onClick={() => handleRemoveMember(athlete, "athlete")}
                      disabled={isUpdatingMembership}
                    >
                      Ta bort
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className="btn btn-error btn-sm"
              onClick={handleDeleteGroup}
              disabled={isUpdatingMembership}
            >
              Radera grupp
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function TrainingGroupsPage() {
  const router = useRouter();
  const { user, profile, isLoading, isLoadingProfile } = useAuth();
  const [groupName, setGroupName] = useState("");
  const [headCoach, setHeadCoach] = useState<AthleteRow | null>(null);
  const [assistantCoaches, setAssistantCoaches] = useState<AthleteRow[]>([]);
  const [athletes, setAthletes] = useState<AthleteRow[]>([]);
  const [coachSearchTerm, setCoachSearchTerm] = useState("");
  const [athleteSearchTerm, setAthleteSearchTerm] = useState("");
  const [coachResults, setCoachResults] = useState<AthleteRow[]>([]);
  const [athleteResults, setAthleteResults] = useState<AthleteRow[]>([]);
  const [isSearchingCoach, setIsSearchingCoach] = useState(false);
  const [isSearchingAthlete, setIsSearchingAthlete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [groups, setGroups] = useState<TrainingGroupWithMembers[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [pendingInvites, setPendingInvites] = useState<TrainingGroupInvite[]>([]);
  const [isLoadingInvites, setIsLoadingInvites] = useState(false);
  const [isUpdatingMembership, setIsUpdatingMembership] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isCoach = profile?.isCoach ?? false;
  const groupNamePlaceholder = useMemo(
    () => groupName || (headCoach ? `${headCoach.name}s träningsgrupp` : "Träningsgrupp"),
    [groupName, headCoach],
  );

  useEffect(() => {
    if (isLoading || isLoadingProfile) return;

    if (!user) {
      router.replace("/login?redirectTo=/training-groups");
    }
  }, [isLoading, isLoadingProfile, router, user]);

  useEffect(() => {
    if (!profile) return;

    if (profile.isCoach) {
      setHeadCoach((current) => current ?? profile);
    } else {
      setAthletes((current) => {
        if (current.some((athlete) => athlete.id === profile.id)) return current;
        return [profile, ...current];
      });
    }
  }, [profile]);

  useEffect(() => {
    if (!profile?.id) return;

    const loadGroups = async () => {
      setIsLoadingGroups(true);
      setError(null);
      setNotice(null);

      try {
        const loadedGroups = await getTrainingGroupsForUser(profile.id);
        setGroups(loadedGroups);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : String(loadError));
      } finally {
        setIsLoadingGroups(false);
      }
    };

    void loadGroups();
  }, [profile?.id]);

  useEffect(() => {
    if (!profile?.id) return;

    const loadInvites = async () => {
      setIsLoadingInvites(true);
      setError(null);
      setNotice(null);

      try {
        const invites = await getPendingTrainingGroupInvites(profile.id);
        setPendingInvites(invites);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : String(loadError));
      } finally {
        setIsLoadingInvites(false);
      }
    };

    void loadInvites();
  }, [profile?.id]);

  const handleSearchCoaches = async () => {
    setIsSearchingCoach(true);
    setError(null);
    setNotice(null);

    try {
      const results = await searchUsers(coachSearchTerm, "coach");
      setCoachResults(results);
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : String(searchError));
    } finally {
      setIsSearchingCoach(false);
    }
  };

  const handleSearchAthletes = async () => {
    setIsSearchingAthlete(true);
    setError(null);
    setNotice(null);

    try {
      const results = await searchUsers(athleteSearchTerm, "athlete");
      setAthleteResults(results);
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : String(searchError));
    } finally {
      setIsSearchingAthlete(false);
    }
  };

  const addAssistantCoach = (coach: AthleteRow) => {
    if (headCoach?.id === coach.id) return;

    setAssistantCoaches((current) => {
      if (current.some((candidate) => candidate.id === coach.id)) return current;
      return [...current, coach];
    });
  };

  const addAthlete = (athlete: AthleteRow) => {
    setAthletes((current) => {
      if (current.some((candidate) => candidate.id === athlete.id)) return current;
      return [...current, athlete];
    });
  };

  const handleCreateGroup = async () => {
    if (!headCoach) {
      setError("Välj en huvudcoach för gruppen.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setNotice(null);

    try {
      const newGroup = await createTrainingGroup({
        name: groupName || groupNamePlaceholder,
        headCoachId: headCoach.id,
        assistantCoachIds: assistantCoaches.map((coach) => coach.id),
        athleteIds: athletes.map((athlete) => athlete.id),
        createdById: profile?.id,
      });

      setGroups((current) => [newGroup, ...current.filter((group) => group.id !== newGroup.id)]);
      setGroupName("");
      setAssistantCoaches([]);
      setAthletes(profile && !profile.isCoach ? [profile] : []);
    } catch (creationError) {
      setError(creationError instanceof Error ? creationError.message : String(creationError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const refreshGroupsAndInvites = async () => {
    if (!profile?.id) return;

    setIsLoadingGroups(true);
    setIsLoadingInvites(true);
    setNotice(null);
    setError(null);

    try {
      const [loadedGroups, loadedInvites] = await Promise.all([
        getTrainingGroupsForUser(profile.id),
        getPendingTrainingGroupInvites(profile.id),
      ]);
      setGroups(loadedGroups);
      setPendingInvites(loadedInvites);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : String(loadError));
    } finally {
      setIsLoadingGroups(false);
      setIsLoadingInvites(false);
    }
  };

  const handleInviteResponse = async (
    invite: TrainingGroupInvite,
    decision: "accept" | "decline",
  ) => {
    if (!profile?.id) return;

    setIsUpdatingMembership(true);
    setError(null);
    setNotice(null);

    try {
      if (decision === "accept") {
        await acceptTrainingGroupInvite(invite.groupId, invite.role, profile.id);
      } else {
        await declineTrainingGroupInvite(invite.groupId, invite.role, profile.id);
      }
      await refreshGroupsAndInvites();
    } catch (responseError) {
      setError(responseError instanceof Error ? responseError.message : String(responseError));
    } finally {
      setIsUpdatingMembership(false);
    }
  };

  const handleLeaveGroup = async (group: TrainingGroupWithMembers) => {
    if (!profile?.id) return;
    const role = getGroupRoleForUser(group, profile.id);
    if (role !== "assistantCoach" && role !== "athlete") return;

    setIsUpdatingMembership(true);
    setError(null);
    setNotice(null);

    try {
      await leaveTrainingGroup(group.id, role, profile.id);
      setGroups((current) => current.filter((item) => item.id !== group.id));
    } catch (leaveError) {
      setError(leaveError instanceof Error ? leaveError.message : String(leaveError));
    } finally {
      setIsUpdatingMembership(false);
    }
  };

  const disableGroupCreation = isSubmitting || !headCoach || athletes.length === 0;

  if (isLoading || isLoadingProfile || !user) {
    return (
      <div className="flex flex-1 items-center justify-center py-12">
        <span className="loading loading-spinner loading-lg" aria-label="Laddar träningsgrupper" />
      </div>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Träningsgrupper</h1>
        <p className="text-base text-base-content/70">
          Skapa grupper där en huvudcoach samlar sina atleter. Du kan även lägga till assisterande
          coacher som stöd. Atleter och assisterande coacher måste bekräfta innan de läggs till.
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}
      {notice && (
        <div className="alert alert-success">
          <span>{notice}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card border border-base-300 bg-base-200 shadow-sm lg:col-span-2">
          <div className="card-body gap-6">
            <div className="flex flex-col gap-2">
              <h2 className="card-title">Ny träningsgrupp</h2>
              <p className="text-sm text-base-content/70">
                Både coacher och atleter kan söka efter varandra. Gruppen skapas under vald huvudcoach,
                och varje atlet kopplas till den.
              </p>
            </div>

            <div className="form-control gap-2">
              <label className="label" htmlFor="group-name">
                <span className="label-text">Gruppnamn</span>
              </label>
              <input
                id="group-name"
                type="text"
                className="input input-bordered"
                placeholder={groupNamePlaceholder}
                value={groupName}
                onChange={(event) => setGroupName(event.target.value)}
              />
              <p className="text-xs text-base-content/60">
                Namnet kan ändras senare. Ange något som hjälper atleterna att känna igen gruppen.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-3 rounded-xl border border-base-300 bg-base-100 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold">Huvudcoach</p>
                    <p className="text-sm text-base-content/70">
                      En grupp kan bara ha en huvudcoach. Sök efter coacher för att byta.
                    </p>
                  </div>
                  {headCoach && !isCoach && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setHeadCoach(null)}
                      type="button"
                    >
                      Byt coach
                    </button>
                  )}
                </div>

                {headCoach ? (
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                    <p className="text-sm font-semibold">{headCoach.name}</p>
                    <p className="text-xs text-base-content/70">{headCoach.email}</p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-base-300 bg-base-100 p-3 text-sm text-base-content/70">
                    Ingen huvudcoach vald än.
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label className="label" htmlFor="coach-search">
                    <span className="label-text">Sök coacher</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="coach-search"
                      type="search"
                      className="input input-bordered flex-1"
                      placeholder="Sök på namn eller e-post"
                      value={coachSearchTerm}
                      onChange={(event) => setCoachSearchTerm(event.target.value)}
                    />
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={handleSearchCoaches}
                      disabled={isSearchingCoach}
                    >
                      {isSearchingCoach ? "Söker..." : "Sök"}
                    </button>
                  </div>
                  {coachResults.length > 0 && (
                    <div className="mt-2 flex flex-col gap-2">
                      {coachResults.map((coach) => (
                        <div
                          key={coach.id}
                          className="flex items-center justify-between gap-2 rounded-lg border border-base-300 bg-base-100 p-2"
                        >
                          <div className="text-sm">
                            <p className="font-semibold">{coach.name}</p>
                            <p className="text-xs text-base-content/70">{coach.email}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              className="btn btn-ghost btn-xs"
                              type="button"
                              onClick={() => setHeadCoach(coach)}
                            >
                              Gör till huvudcoach
                            </button>
                            <button
                              className="btn btn-outline btn-xs"
                              type="button"
                              onClick={() => addAssistantCoach(coach)}
                            >
                              Lägg till som assisterande
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <p className="font-semibold">Assisterande coacher</p>
                  {assistantCoaches.length === 0 ? (
                    <p className="text-sm text-base-content/60">Inga assisterande coacher valda.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {assistantCoaches.map((coach) => (
                        <span key={coach.id} className="badge badge-outline gap-2">
                          {coach.name}
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs"
                            onClick={() => setAssistantCoaches((current) => removeUserById(current, coach.id))}
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3 rounded-xl border border-base-300 bg-base-100 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold">Atleter</p>
                    <p className="text-sm text-base-content/70">
                      Lägg till en eller flera atleter i gruppen.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="label" htmlFor="athlete-search">
                    <span className="label-text">Sök atleter</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="athlete-search"
                      type="search"
                      className="input input-bordered flex-1"
                      placeholder="Sök på namn eller e-post"
                      value={athleteSearchTerm}
                      onChange={(event) => setAthleteSearchTerm(event.target.value)}
                    />
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={handleSearchAthletes}
                      disabled={isSearchingAthlete}
                    >
                      {isSearchingAthlete ? "Söker..." : "Sök"}
                    </button>
                  </div>
                  {athleteResults.length > 0 && (
                    <div className="mt-2 flex flex-col gap-2">
                      {athleteResults.map((athlete) => (
                        <div
                          key={athlete.id}
                          className="flex items-center justify-between gap-2 rounded-lg border border-base-300 bg-base-100 p-2"
                        >
                          <div className="text-sm">
                            <p className="font-semibold">{athlete.name}</p>
                            <p className="text-xs text-base-content/70">{athlete.email}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              className="btn btn-outline btn-xs"
                              type="button"
                              onClick={() => addAthlete(athlete)}
                            >
                              Lägg till i gruppen
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <p className="font-semibold">Valda atleter</p>
                  {athletes.length === 0 ? (
                    <p className="text-sm text-base-content/60">Inga atleter valda.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {athletes.map((athlete) => {
                        const isLocked = !isCoach && athlete.id === profile?.id;
                        return (
                          <span key={athlete.id} className="badge badge-outline gap-2">
                            {formatUser(athlete)}
                            {!isLocked && (
                              <button
                                type="button"
                                className="btn btn-ghost btn-xs"
                                onClick={() => setAthletes((current) => removeUserById(current, athlete.id))}
                              >
                                ✕
                              </button>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-base-300 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-base-content/70">
                Minst en atlet krävs för att skapa en grupp.
              </p>
              <button
                className="btn btn-primary"
                type="button"
                disabled={disableGroupCreation}
                onClick={handleCreateGroup}
              >
                {isSubmitting ? "Skapar grupp..." : "Skapa träningsgrupp"}
              </button>
            </div>
          </div>
        </div>

        <div className="card border border-base-300 bg-base-200 shadow-sm">
          <div className="card-body gap-4">
            <div>
              <h2 className="card-title">Dina grupper</h2>
              <p className="text-sm text-base-content/70">
                Du ser alla grupper där du är huvudcoach, assisterande coach eller atlet.
              </p>
            </div>

            {isLoadingGroups || isLoadingInvites ? (
              <div className="flex items-center justify-center py-6">
                <span className="loading loading-spinner" aria-label="Laddar grupper" />
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-base-content/60">
                    Inbjudningar
                  </h3>
                  {pendingInvites.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-base-300 bg-base-100 p-3 text-sm text-base-content/60">
                      Inga väntande inbjudningar.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {pendingInvites.map((invite) => (
                        <div
                          key={`${invite.groupId}-${invite.role}`}
                          className="rounded-lg border border-base-300 bg-base-100 p-3 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold">{invite.groupName}</p>
                              <p className="text-xs text-base-content/70">
                                Huvudcoach: {invite.headCoach.name}
                              </p>
                              <p className="text-xs text-base-content/60">
                                Roll: {invite.role === "assistantCoach" ? "Assisterande coach" : "Atlet"}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              className="btn btn-primary btn-sm"
                              type="button"
                              onClick={() => handleInviteResponse(invite, "accept")}
                              disabled={isUpdatingMembership}
                            >
                              Acceptera
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              type="button"
                              onClick={() => handleInviteResponse(invite, "decline")}
                              disabled={isUpdatingMembership}
                            >
                              Avböj
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="divider my-2" />

                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-base-content/60">
                    Aktiva grupper
                  </h3>
                  {groups.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-base-300 bg-base-100 p-3 text-sm text-base-content/60">
                      Inga grupper hittades ännu.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {groups.map((group) => {
                        const role = profile?.id ? getGroupRoleForUser(group, profile.id) : null;
                        const canLeave = role === "assistantCoach" || role === "athlete";
                        const isHeadCoach = role === "headCoach";
                        const canManage = isHeadCoach;
                        return (
                          <div
                            key={group.id}
                            className="rounded-lg border border-base-300 bg-base-100 p-3 shadow-sm"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate font-semibold">{group.name}</p>
                                <p className="text-xs text-base-content/70">
                                  Huvudcoach: {group.headCoach.name}
                                </p>
                              </div>
                              <div className="badge badge-outline shrink-0 whitespace-nowrap">
                                {group.athletes.length} atleter
                              </div>
                            </div>

                            {group.assistantCoaches.length > 0 && (
                              <p className="mt-2 text-xs text-base-content/70">
                                Assisterande coacher:{" "}
                                {group.assistantCoaches.map((coach) => coach.name).join(", ")}
                              </p>
                            )}

                            {group.athletes.length > 0 && (
                              <p className="text-xs text-base-content/70">
                                Atleter: {group.athletes.map((athlete) => athlete.name).join(", ")}
                              </p>
                            )}

                            {canLeave && (
                              <div className="mt-3 flex justify-end">
                                <button
                                  className="btn btn-outline btn-xs"
                                  type="button"
                                  onClick={() => handleLeaveGroup(group)}
                                  disabled={isUpdatingMembership}
                                >
                                  Lämna grupp
                                </button>
                              </div>
                            )}

                            {canManage && (
                              <GroupManagementPanel
                                group={group}
                                onRefresh={refreshGroupsAndInvites}
                                onError={(message) => setError(message || null)}
                                onNotice={setNotice}
                                setIsUpdatingMembership={setIsUpdatingMembership}
                                isUpdatingMembership={isUpdatingMembership}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
