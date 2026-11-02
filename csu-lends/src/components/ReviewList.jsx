import { Link } from "react-router-dom";
import StarRating from "./StarRating";
import { initialOf } from "../lib/people";
import { timeAgo } from "../lib/timeAgo";

// Ratings a student has received.
export default function ReviewList({ reviews, emptyText = "No ratings yet." }) {
  if (reviews.length === 0) return <p className="reviews-empty">{emptyText}</p>;

  return (
    <ul className="reviews">
      {reviews.map((review) => {
        const name = review.reviewer?.full_name || "A classmate";
        return (
          <li key={review.id} className="review">
            <span className="review-avatar" aria-hidden="true">{initialOf(name)}</span>
            <div className="review-body">
              <div className="review-top">
                {review.reviewer?.id ? (
                  <Link to={`/students/${review.reviewer.id}`} className="review-name">{name}</Link>
                ) : (
                  <strong className="review-name">{name}</strong>
                )}
                <span className="review-time">{timeAgo(review.created_at)}</span>
              </div>
              <StarRating value={review.rating} showNumber={false} />
              {review.comment && <p className="review-comment">{review.comment}</p>}
              <span className="review-meta">
                As {review.reviewee_role}
                {review.item_name ? ` · ${review.item_name}` : ""}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
