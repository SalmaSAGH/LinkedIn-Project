import { Suspense } from "react";
import SearchPageClient from "./SearchPageClient";

export const dynamic = "force-dynamic"; // si tu fais du CSR

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="p-6">Chargement...</div>}>
            <SearchPageClient />
        </Suspense>
    );
}
