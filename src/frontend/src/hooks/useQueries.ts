import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { Principal } from '@dfinity/principal';
import type { PostId, UserProfile, ExternalBlob, MediaType } from '../backend';

export function useGetAllPosts() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPosts();
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
  });
}

export function useGetPost(postId: string) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getPost(BigInt(postId));
    },
    enabled: !!actor && !isFetching && !!postId,
    staleTime: 0,
  });
}

export function useGetLockedPostContent(postId: string, isLocked: boolean) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ['lockedContent', postId, identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getLockedPostContent(BigInt(postId));
    },
    enabled: !!actor && !isFetching && isLocked && !!identity,
    retry: false,
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { title: string; content: string; isLocked: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createPost(data.title, data.content, data.isLocked);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useUpdatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { postId: PostId; title: string; content: string; isLocked: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updatePost(data.postId, data.title, data.content, data.isLocked);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', variables.postId.toString()] });
    },
  });
}

export function useDeletePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: PostId) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deletePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useUpdatePostTimestamp() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: PostId) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updatePostTimestamp(postId);
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', postId.toString()] });
    },
  });
}

export function useGrantAccess() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (principal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.grantAccess(principal);
    },
  });
}

export function useRevokeAccess() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (principal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.revokeAccess(principal);
    },
  });
}

export function useHasAccess(principalText: string) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['hasAccess', principalText],
    queryFn: async () => {
      if (!actor || !principalText) return false;
      try {
        const principal = Principal.fromText(principalText);
        return actor.hasAccess(principal);
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching && !!principalText,
  });
}

export function useAddMediaToPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { postId: PostId; file: ExternalBlob; mediaType: MediaType }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addMediaToPost(data.postId, data.file, data.mediaType);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['post', variables.postId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useRemoveMediaFromPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { postId: PostId; mediaIndex: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeMediaFromPost(data.postId, data.mediaIndex);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['post', variables.postId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}
