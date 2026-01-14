import CreateFlockForm from '@/components/features/flock/CreateFlockForm';
import { Helmet } from 'react-helmet-async';

// Rule applied: Use TypeScript for all code
function FlockCreatePage(): JSX.Element {
  return (
    <>
      <Helmet>
        <title>Create New Flock | TaskMaster</title>
        <meta name="description" content="Create a new flock to manage tasks and collaborate with others" />
      </Helmet>
      {/* Rule applied: Use Tailwind classes for layout */}
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mt-8 mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-center mb-4">
            Create New Flock
          </h1>
          <CreateFlockForm />
        </div>
      </div>
    </>  
  );
}

export default FlockCreatePage; 