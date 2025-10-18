class Trip {
  constructor({
    tripId,
    tripName,
    tripDescription,
    tripActivities = [],
    campGrounds = [],
    recAreaName,
    recAreaId,
    ownerId,
    invitedUsers = [],
    startDate,
    endDate,
    createdAt,
    ownerUsername,
  }) {
    this.tripId = tripId;
    this.tripName = tripName;
    this.tripDescription = tripDescription; 
    this.tripActivities = tripActivities; 
    this.campGrounds = campGrounds; 
    this.recAreaName = recAreaName;
    this.recAreaId = recAreaId;
    this.ownerId = ownerId;
    this.invitedUsers = invitedUsers;
    this.startDate = startDate;
    this.endDate = endDate;
    this.createdAt = createdAt || Date.now();
    this.ownerUsername = ownerUsername;
  }
}

module.exports = Trip;