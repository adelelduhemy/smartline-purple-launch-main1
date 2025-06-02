import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext'; // Assuming you have an AuthContext to get user info

// Simple Star Rating Component (can be replaced with a library later)
const StarRating = ({ rating, onRatingChange }: { rating: number | null; onRatingChange: (rating: number) => void }) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex space-x-1">
      {stars.map((star) => (
        <svg
          key={star}
          className={`w-6 h-6 cursor-pointer ${rating !== null && star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
          onClick={() => onRatingChange(star)}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.792 2.03a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.792-2.03a1 1 0 00-1.118 0l-2.792 2.03c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"></path>
        </svg>
      ))}
    </div>
  );
};

const FeedbackForm = () => {
  const { user } = useAuth(); // Get logged-in user info
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleSubmitFeedback = async () => {
    if (rating === null) {
      alert('Please provide a rating.');
      return;
    }

    if (!user) {
      alert('You must be logged in to submit feedback.');
      return;
    }

    setLoading(true);
    setFeedbackSubmitted(false);

    try {
      const response = await fetch('http://localhost:3000/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          user_type: user.role, // Assuming user.role is 'passenger' or 'driver'
          rating: rating,
          comment: comment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit feedback');
      }

      alert('Feedback submitted successfully!');
      setFeedbackSubmitted(true);
      // Optionally clear the form after submission
      setRating(null);
      setComment('');
    } catch (error) {
      console.error('Feedback submission error:', error);
      alert(error instanceof Error ? error.message : 'An error occurred while submitting feedback.');
    } finally {
      setLoading(false);
    }
  };

  // Don't render the form if no user is logged in or if feedback is already submitted
  if (!user) {
    return null; // Or a message asking them to log in
  }

  // If you only want one feedback submission per user/session, uncomment below
  // if (feedbackSubmitted) {
  //   return <div className="text-center text-green-600">Thank you for your feedback!</div>;
  // }

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Share Your Feedback</h2>
          <p className="text-gray-600">Help us improve SmartLine by sharing your experience and rating our service</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label>Rate Your Experience</Label>
              <StarRating rating={rating} onRatingChange={setRating} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback-comment">Your Feedback</Label>
              <Textarea
                id="feedback-comment"
                placeholder="Tell us about your experience with SmartLine..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
            </div>

            <Button 
              onClick={handleSubmitFeedback} 
              className="w-full h-12 text-lg font-medium bg-primary-600 hover:bg-primary-700"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FeedbackForm; 