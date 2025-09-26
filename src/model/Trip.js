class Trip {
  constructor({ tripId, tripName, ownerId, description, recArea, guests, createdAt }) {
    this.tripId = tripId;
    this.tripName = tripName;
    this.ownerId = ownerId;
    this.description = description || "";
    this.recArea = recArea || {};
    this.guests = guests || [];
    this.createdAt = createdAt || Date.now();
  }
}

module.exports = Trip;