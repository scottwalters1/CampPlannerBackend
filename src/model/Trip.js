class Trip {
  constructor({
    tripId,
    tripName,
    description,
    activities,
    recName,
    recAreaId,
    ownerId,
    invitedUsers,
    startDate,
    endDate,
    createdAt
  }) {
    this.tripId = tripId;
    this.tripName = tripName;
    this.description = description;
    this.activities = activities || [];
    this.recName = recName;
    this.recAreaId = recAreaId;
    this.ownerId = ownerId;
    this.invitedUsers = invitedUsers;
    this.createdAt = createdAt || Date.now();
    this.startDate = startDate;
    this.endDate = endDate;
  }
}

module.exports = Trip;
