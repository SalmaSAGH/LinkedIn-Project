import PostPageClient from "./PostPageClient";

export default async function Page({
                                       params: { postId },
                                   }: {
    params: { postId: string };
}) {
    return <PostPageClient postId={postId} />;
}