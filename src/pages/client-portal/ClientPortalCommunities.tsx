import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ArrowLeft, Send, ThumbsUp, Lightbulb, Heart, Flag, MessageSquare, Plus, ArrowRight, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCommunities } from '@/hooks/useCommunities';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function ClientPortalCommunities() {
  const { user } = useAuth();
  const {
    groups, groupsLoading, memberships, joinedGroupIds,
    getAnonUsername, joinGroup, leaveGroup, requestGroup,
    createPost, addReaction, flagPost, useGroupPosts,
    useGroupMembers, usePostReactions, rank,
  } = useCommunities();

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestData, setRequestData] = useState({ group_name: '', description: '', reason: '' });
  const [newPostText, setNewPostText] = useState('');
  const [postType, setPostType] = useState<'text' | 'poll'>('text');
  const [pollOptions, setPollOptions] = useState(['', '']);

  const selectedGroup = groups.find((g: any) => g.id === selectedGroupId);
  const isMember = selectedGroupId ? joinedGroupIds.includes(selectedGroupId) : false;

  const { data: posts = [] } = useGroupPosts(selectedGroupId);
  const { data: members = [] } = useGroupMembers(selectedGroupId);
  const postIds = posts.map((p: any) => p.id);
  const { data: reactions = [] } = usePostReactions(postIds);

  const memberMap: Record<string, string> = {};
  for (const m of members as any[]) {
    memberMap[m.user_id] = m.anon_username;
  }

  const getReactionsForPost = (postId: string) => {
    const postReactions = (reactions as any[]).filter(r => r.post_id === postId);
    return {
      like: postReactions.filter(r => r.reaction_type === 'like').length,
      insightful: postReactions.filter(r => r.reaction_type === 'insightful').length,
      support: postReactions.filter(r => r.reaction_type === 'support').length,
      userReaction: postReactions.find(r => r.user_id === user?.id)?.reaction_type || null,
    };
  };

  const handleSubmitPost = () => {
    if (!selectedGroupId || !newPostText.trim()) return;
    if (newPostText.length > 500) {
      toast.error('Maximal 500 Zeichen');
      return;
    }

    if (postType === 'poll') {
      const validOptions = pollOptions.filter(o => o.trim());
      if (validOptions.length < 2) {
        toast.error('Mindestens 2 Optionen für eine Umfrage');
        return;
      }
      createPost.mutate({
        group_id: selectedGroupId,
        content: newPostText,
        post_type: 'poll',
        poll_options: validOptions,
      });
    } else {
      createPost.mutate({ group_id: selectedGroupId, content: newPostText });
    }
    setNewPostText('');
    setPollOptions(['', '']);
    setPostType('text');
  };

  const handleRequestSubmit = () => {
    if (!requestData.group_name.trim()) {
      toast.error('Bitte Gruppenname angeben');
      return;
    }
    requestGroup.mutate(requestData);
    setShowRequestForm(false);
    setRequestData({ group_name: '', description: '', reason: '' });
  };

  const timeAgo = (dateStr: string): string => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'gerade eben';
    if (mins < 60) return `vor ${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `vor ${hours}h`;
    const days = Math.floor(hours / 24);
    return `vor ${days}d`;
  };

  // ── GROUP FEED VIEW ──
  if (selectedGroup) {
    return (
      <ClientPortalLayout>
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSelectedGroupId(null)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-foreground truncate">
                {(selectedGroup as any).icon_emoji} {(selectedGroup as any).name}
              </h1>
              <p className="text-xs text-muted-foreground">
                {(members as any[]).length} Mitglieder · Anonym
              </p>
            </div>
            {isMember ? (
              <Button variant="outline" size="sm" onClick={() => leaveGroup.mutate(selectedGroupId!)}>
                Verlassen
              </Button>
            ) : (
              <Button size="sm" onClick={() => joinGroup.mutate(selectedGroupId!)} disabled={joinedGroupIds.length >= 5}>
                Beitreten
              </Button>
            )}
          </div>

          {/* Disclaimer */}
          <div className="bg-muted/50 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Alle Beiträge sind anonym. Keine Finanzberatung von Nutzern an Nutzer. 
              Keine spezifischen CHF-Beträge teilen. Respektvoller Umgang.
            </p>
          </div>

          {/* New Post (members only) */}
          {isMember && (
            <Card>
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-[10px]">
                    {getAnonUsername(selectedGroupId!)} {rank.emoji}
                  </Badge>
                  <div className="flex gap-1 ml-auto">
                    <Button
                      variant={postType === 'text' ? 'default' : 'ghost'}
                      size="sm"
                      className="h-6 text-[10px] px-2"
                      onClick={() => setPostType('text')}
                    >
                      Text
                    </Button>
                    <Button
                      variant={postType === 'poll' ? 'default' : 'ghost'}
                      size="sm"
                      className="h-6 text-[10px] px-2"
                      onClick={() => setPostType('poll')}
                    >
                      Umfrage
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value.slice(0, 500))}
                  placeholder={postType === 'poll' ? 'Frage für die Umfrage...' : 'Was beschäftigt dich?'}
                  className="min-h-[60px] text-sm resize-none"
                />
                <div className="flex items-center justify-between">
                  <span className={cn("text-[10px]", newPostText.length > 450 ? "text-destructive" : "text-muted-foreground")}>
                    {newPostText.length}/500
                  </span>
                  <Button size="sm" onClick={handleSubmitPost} disabled={!newPostText.trim() || createPost.isPending} className="gap-1">
                    <Send className="h-3 w-3" /> Posten
                  </Button>
                </div>

                {/* Poll options */}
                {postType === 'poll' && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[10px] font-medium text-muted-foreground">Optionen:</p>
                    {pollOptions.map((opt, i) => (
                      <Input
                        key={i}
                        value={opt}
                        onChange={(e) => {
                          const next = [...pollOptions];
                          next[i] = e.target.value;
                          setPollOptions(next);
                        }}
                        placeholder={`Option ${i + 1}`}
                        className="h-8 text-xs"
                      />
                    ))}
                    {pollOptions.length < 6 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[10px] gap-1"
                        onClick={() => setPollOptions([...pollOptions, ''])}
                      >
                        <Plus className="h-3 w-3" /> Option hinzufügen
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Posts Feed */}
          {(posts as any[]).length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Noch keine Beiträge. Sei der Erste!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(posts as any[]).map((post) => {
                const rx = getReactionsForPost(post.id);
                const authorName = memberMap[post.author_id] || 'Anon';

                return (
                  <motion.div key={post.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                    <Card>
                      <CardContent className="p-3 space-y-2">
                        {/* Author + time */}
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-[10px] font-normal">
                            {authorName}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">{timeAgo(post.created_at)}</span>
                        </div>

                        {/* Content */}
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{post.content}</p>

                        {/* Poll */}
                        {post.post_type === 'poll' && post.poll_options && (
                          <div className="space-y-1.5 pt-1">
                            {(post.poll_options as string[]).map((option: string) => {
                              const votes = (post.poll_votes as any)?.[option] || 0;
                              const totalVotes = Object.values((post.poll_votes as any) || {}).reduce((s: number, v: any) => s + Number(v), 0) as number;
                              const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
                              return (
                                <div key={option} className="relative bg-muted/50 rounded-lg p-2 overflow-hidden">
                                  <div
                                    className="absolute inset-y-0 left-0 bg-primary/10 rounded-lg"
                                    style={{ width: `${pct}%` }}
                                  />
                                  <div className="relative flex items-center justify-between">
                                    <span className="text-xs text-foreground">{option}</span>
                                    <span className="text-[10px] text-muted-foreground font-mono">{pct}%</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Reactions */}
                        <div className="flex items-center gap-1 pt-1">
                          {[
                            { type: 'like', icon: ThumbsUp, count: rx.like },
                            { type: 'insightful', icon: Lightbulb, count: rx.insightful },
                            { type: 'support', icon: Heart, count: rx.support },
                          ].map(({ type, icon: Icon, count }) => (
                            <Button
                              key={type}
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "h-7 px-2 gap-1 text-[10px]",
                                rx.userReaction === type && "bg-primary/10 text-primary"
                              )}
                              onClick={() => {
                                if (rx.userReaction) return;
                                addReaction.mutate({ post_id: post.id, reaction_type: type });
                              }}
                              disabled={!!rx.userReaction}
                            >
                              <Icon className="h-3 w-3" />
                              {count > 0 && count}
                            </Button>
                          ))}

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 ml-auto text-muted-foreground"
                            onClick={() => flagPost.mutate(post.id)}
                          >
                            <Flag className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </ClientPortalLayout>
    );
  }

  // ── GROUP LIST VIEW ──
  return (
    <ClientPortalLayout>
      <div className="max-w-2xl mx-auto space-y-5">
        <ScreenHeader title="Communities" backTo="/app/client-portal/friends" />

        <p className="text-xs text-muted-foreground px-1">
          Tausche dich anonym mit Gleichgesinnten aus. Maximal 5 Gruppen.
          Deine Mitgliedschaften: {memberships.length}/5
        </p>

        {/* Groups grid */}
        <div className="space-y-2">
          {(groups as any[]).map((group, i) => {
            const joined = joinedGroupIds.includes(group.id);
            return (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card
                  className={cn(
                    "cursor-pointer active:scale-[0.99] transition-all",
                    joined && "border-primary/30 bg-primary/5"
                  )}
                  onClick={() => {
                    if (joined) {
                      setSelectedGroupId(group.id);
                    } else if (joinedGroupIds.length < 5) {
                      joinGroup.mutate(group.id);
                    } else {
                      toast.error('Maximum 5 Gruppen erreicht');
                    }
                  }}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-muted flex items-center justify-center text-xl shrink-0">
                      {group.icon_emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{group.name}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">{group.description}</p>
                    </div>
                    {joined ? (
                      <Badge variant="secondary" className="text-[10px] shrink-0">Mitglied</Badge>
                    ) : (
                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Suggest new group */}
        <Separator />
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">Deine Gruppe nicht dabei?</p>
          <Button variant="outline" onClick={() => setShowRequestForm(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Neue Gruppe vorschlagen
          </Button>
        </div>

        {/* Request Dialog */}
        <Dialog open={showRequestForm} onOpenChange={setShowRequestForm}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Neue Gruppe vorschlagen</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-foreground">Gruppenname</label>
                <Input
                  value={requestData.group_name}
                  onChange={(e) => setRequestData(d => ({ ...d, group_name: e.target.value }))}
                  placeholder="z.B. 'Studierende & Berufseinstieg'"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground">Beschreibung</label>
                <Textarea
                  value={requestData.description}
                  onChange={(e) => setRequestData(d => ({ ...d, description: e.target.value }))}
                  placeholder="Worum geht es in der Gruppe?"
                  className="mt-1 min-h-[60px]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground">Warum diese Gruppe?</label>
                <Textarea
                  value={requestData.reason}
                  onChange={(e) => setRequestData(d => ({ ...d, reason: e.target.value }))}
                  placeholder="Was wäre der Mehrwert?"
                  className="mt-1 min-h-[60px]"
                />
              </div>
              <Button
                className="w-full"
                onClick={handleRequestSubmit}
                disabled={requestGroup.isPending}
              >
                Vorschlag senden
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ClientPortalLayout>
  );
}
