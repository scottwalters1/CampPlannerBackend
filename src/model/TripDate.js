class TripDate {
  constructor({ tripId, date, campsiteId, activities }) {
    this.tripId = tripId;
    this.date = date; // use UTC time for standardization, maybe adapt to users when displaying
    this.campsiteId = campsiteId || null;
    this.activities = activities || []; 
  }
}

module.exports = TripDate;
