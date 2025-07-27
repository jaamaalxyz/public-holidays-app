import { memo } from 'react';
import type { Holiday } from '../types/api';
import { getLocalizedText, formatHolidayDate } from '../services/holidaysApi';

interface HolidayCardProps {
  holiday: Holiday;
}

export const HolidayCard = memo(function HolidayCard({
  holiday,
}: HolidayCardProps) {
  const holidayName = getLocalizedText(holiday.name);
  const comment = holiday.comment ? getLocalizedText(holiday.comment) : null;

  return (
    <div className="col-12 col-6-md">
      <div className="card margin-bottom-small">
        <div className="card-body">
          <h5 className="card-title">{holidayName}</h5>

          <p className="text-muted">
            <strong>Date:</strong> {formatHolidayDate(holiday.startDate)}
            {holiday.startDate !== holiday.endDate && (
              <> - {formatHolidayDate(holiday.endDate)}</>
            )}
          </p>

          {comment && (
            <p className="text-muted margin-bottom-small">
              <em>{comment}</em>
            </p>
          )}

          <div>
            <span
              className={`badge ${
                holiday.nationwide ? 'badge-success' : 'badge-warning'
              }`}
              aria-label={
                holiday.nationwide ? 'Nationwide holiday' : 'Regional holiday'
              }
            >
              {holiday.nationwide ? 'Nationwide' : 'Regional'}
            </span>
            <span
              className="badge badge-secondary margin-left-small"
              aria-label={`Holiday type: ${holiday.type}`}
            >
              {holiday.type}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});
