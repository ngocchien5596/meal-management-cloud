import { redirect } from 'next/navigation';

export default function MealDetailPage({ params }: { params: { id: string } }) {
    redirect(`/meals/${params.id}/ingredients`);
}
