import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    console.log('GitHub push API called');

    // Check if GitHub token is configured
    if (!process.env.GITHUB_TOKEN) {
      console.error('GitHub token not configured');
      return NextResponse.json(
        { error: 'GitHub token not configured' },
        { status: 500 }
      );
    }

    // Get commit message from request body (optional)
    const body = await request.json().catch(() => ({}));
    const commitMessage = body.message || `Admin update: ${new Date().toISOString()}`;

    console.log('Pushing changes to GitHub with message:', commitMessage);

    try {
      // Check if there are any changes to commit
      const { stdout: statusOutput } = await execAsync('git status --porcelain');
      
      if (statusOutput.trim() === '') {
        // No changes to commit
        console.log('No changes to commit');
        return NextResponse.json({
          success: true,
          message: 'No changes to commit. Repository is up to date.',
          hasChanges: false
        });
      }

      // Add all changes
      console.log('Adding changes...');
      await execAsync('git add .');

      // Commit changes
      console.log('Committing changes...');
      await execAsync(`git commit -m "${commitMessage}"`);

      // Push to GitHub
      console.log('Pushing to GitHub...');
      const { stdout: pushOutput, stderr: pushError } = await execAsync('git push');
      
      console.log('Push successful:', pushOutput);
      if (pushError) {
        console.log('Push stderr (usually normal):', pushError);
      }

      return NextResponse.json({
        success: true,
        message: 'Changes successfully pushed to GitHub!',
        hasChanges: true,
        commitMessage,
        output: pushOutput
      });

    } catch (gitError: any) {
      console.error('Git operation failed:', gitError);
      
      // Handle specific git errors
      if (gitError.message.includes('nothing to commit')) {
        return NextResponse.json({
          success: true,
          message: 'No changes to commit. Repository is up to date.',
          hasChanges: false
        });
      }
      
      if (gitError.message.includes('Authentication failed')) {
        return NextResponse.json(
          { error: 'GitHub authentication failed. Please check your token.' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { 
          error: `Git operation failed: ${gitError.message}`,
          details: gitError.stderr || gitError.stdout
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in GitHub push API:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to push to GitHub'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'GitHub push endpoint - use POST to push changes' },
    { status: 200 }
  );
} 