import { authorizeOperations, customerOverview, recommendNextStep } from '@/lib/operations';
import { getContent } from '@/lib/content';
import { errorResponse } from '@/lib/http';
export const runtime = 'nodejs';
export async function GET(request: Request) {
  try {
    authorizeOperations(request);
    const overview = customerOverview();
    const content = await getContent();
    return Response.json(
      {
        ...overview,
        customers: overview.customers.map((customer) => ({
          ...customer,
          nextAction: recommendNextStep(customer, content),
        })),
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
