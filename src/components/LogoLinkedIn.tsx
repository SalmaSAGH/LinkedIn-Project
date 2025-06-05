export default function LogoLinkedIn({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            role="img"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fill="#0A66C2"
            style={{
                width: '100px',  // Taille augmentée (ex: 100px)
                height: '100px',
                backgroundColor: 'white',
                padding: '12px',  // Espace autour du logo
                borderRadius: '8px',  // Coins légèrement arrondis
                display: 'block'  // Évite les espaces indésirables
            }}
        >
            <title>LinkedIn</title>
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.038-1.852-3.038-1.854 0-2.136 1.445-2.136 2.94v5.667H9.352V9h3.414v1.561h.049c.476-.9 1.637-1.852 3.369-1.852 3.602 0 4.267 2.369 4.267 5.452v6.291zM5.337 7.433a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.119 20.452H3.554V9h3.565v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.727v20.546C0 23.226.792 24 1.771 24h20.451C23.207 24 24 23.226 24 22.273V1.727C24 .774 23.207 0 22.225 0z" />
        </svg>
    );
}