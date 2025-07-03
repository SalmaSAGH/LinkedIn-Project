import PostPageClient from "./PostPageClient";

export default async function Page({ params }: { params: { postId: string } }) {
    return <PostPageClient postId={params.postId} />;
}
