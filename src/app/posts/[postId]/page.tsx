// src/app/posts/[postId]/page.tsx

"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import PostPageClient from "./PostPageClient";

export default function Page() {
    const router = useRouter();
    const params = useParams();
    const postId = params?.postId as string;

    useEffect(() => {
        if (!postId) {
            router.push("/dashboard");
        }
    }, [postId, router]);

    return <PostPageClient postId={postId} />;
}
