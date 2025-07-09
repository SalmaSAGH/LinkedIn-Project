// Mock de next/navigation
jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: jest.fn(), refresh: jest.fn(), prefetch: jest.fn() }),
    usePathname: () => '/',
}));


global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]), // ou {} selon les endpoints
    })
) as jest.Mock;


import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardPage from '@/app/dashboard/page';

describe('DashboardPage', () => {
    it('affiche le dashboard avec les éléments principaux', async () => {
        render(<DashboardPage />);

        // Attend que le texte "Suggestions de connexions" apparaisse
        await waitFor(() =>
            expect(screen.getByText('Suggestions de connexions')).toBeInTheDocument()
        );

        expect(screen.getByPlaceholderText('Partagez une publication...')).toBeInTheDocument();
    });
});
