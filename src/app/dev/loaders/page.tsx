import { ChallengeWaitingState } from '@/components/story/loading/ChallengeWaitingState';
import { StoryPuzzleLoader } from '@/components/story/loading/StoryPuzzleLoader';

export default function DevLoadersPage() {
  return (
    <main className='flex min-h-screen items-center justify-center bg-background p-4'>
      <div className='w-full max-w-md rounded-3xl bg-card p-6 pt-14 shadow-2xl sm:p-8 sm:pt-14'>
        <ChallengeWaitingState text='Connecting the thoughts...'>
          <StoryPuzzleLoader />
        </ChallengeWaitingState>
      </div>
    </main>
  );
}
