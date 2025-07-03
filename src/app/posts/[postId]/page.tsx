import PostPageClient from "./PostPageClient";

interface PageProps {
    params: {
        postId: string;
    };
}

export default async function Page({ params }: PageProps) {
    return <PostPageClient postId={params.postId} />;
}