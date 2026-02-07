import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type PostId = bigint;
export interface Post {
    id: PostId;
    media: Array<MediaAttachment>;
    title: string;
    content: string;
    createdAt: bigint;
    isLocked: boolean;
}
export interface MediaAttachment {
    file: ExternalBlob;
    mediaType: MediaType;
}
export interface UserProfile {
    name: string;
}
export enum MediaType {
    video = "video",
    image = "image"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addMediaToPost(postId: PostId, file: ExternalBlob, mediaType: MediaType): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createPost(title: string, content: string, isLocked: boolean): Promise<PostId>;
    deletePost(postId: PostId): Promise<void>;
    getAllPosts(): Promise<Array<Post>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLockedPostContent(postId: PostId): Promise<string | null>;
    getPost(postId: PostId): Promise<Post | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    grantAccess(user: Principal): Promise<void>;
    hasAccess(user: Principal): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    revokeAccess(user: Principal): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updatePost(postId: PostId, title: string, content: string, isLocked: boolean): Promise<void>;
}
