import PostPageClient from "./PostPageClient";

export default function Page({ params }: { params: { postId: string } }) {
    return <PostPageClient postId={params.postId} />;
}