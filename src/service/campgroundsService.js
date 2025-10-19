// const { logger } = require('../util/logger');
// // RIDB API configuration
// const RIDB_BASE = 'https://ridb.recreation.gov/api/v1';
// const RIDB_API_KEY = 'd5f1c02b-09e5-4486-a6a9-2106c58ec244';

// /**
//  * Javadoc
//  * Get campgrounds by state
//  * @param {Object} locationParams - Location parameters
//  * @param {string} locationParams.state - State code (optional)
//  * @param {number} locationParams.limit - Maximum number of results (optional, default: 50)
//  * @returns {Promise<Array>} Array of campground objects with campsites
//  */
// async function getCampgroundsByLocation(locationParams) {
//   try {
//     const { state, limit = 50 } = locationParams;
    
//     logger.info(`Campgrounds Location Search:`, { state, limit });
    
//     const params = { 
//       limit,
//       query: 'Campground'
//     };
    
//     if (state) {
//       params.state = state;
//     }
    
//     //fetch facilities (campgrounds)
//     const queryString = new URLSearchParams(params).toString();
//     const url = `${RIDB_BASE}/facilities?${queryString}`;
//     const res = await fetch(url, {
//       headers: { apikey: RIDB_API_KEY }
//     });
    
//     if (!res.ok) {
//       throw new Error(`HTTP error! status: ${res.status}`);
//     }
    
//     const data = await res.json();

//     //filter for campgrounds
//     const allFacilities = data.RECDATA;
//     const campgrounds = allFacilities.filter(facility => 
//       (facility.FacilityType && facility.FacilityType.toLowerCase().includes('campground')) ||
//       (facility.FacilityName && facility.FacilityName.toLowerCase().includes('campground'))
//     );

//     //get campsites and activities for each campground
//     const campgroundsWithCampsites = [];
    
//     for (const campground of campgrounds) {
//       try {
//         const [campsites, activities] = await Promise.all([
//           getCampsitesForCampground(campground.FacilityID),
//           getActivitiesForFacility(campground.FacilityID)
//         ]);
        
//         //only include campgrounds that have campsites
//         if (campsites.length > 0) {
//           const campgroundData = {
//             //basic campground info
//             facilityId: campground.FacilityID,
//             name: campground.FacilityName,
//             type: campground.FacilityType,
//             description: campground.FacilityDescription,
            
//             //location info
//             location: {
//               latitude: campground.FacilityLatitude,
//               longitude: campground.FacilityLongitude,
//               address: campground.FacilityAddress || campground.Address || campground.StreetAddress,
//               city: campground.FacilityCity || campground.City,
//               state: campground.FacilityState || campground.State,
//               postalCode: campground.FacilityPostalCode || campground.PostalCode || campground.ZipCode,
//               country: campground.FacilityCountry || campground.Country
//             },
            
//             //contact info
//             contact: {
//               phone: campground.FacilityPhone,
//               email: campground.FacilityEmail
//             },
            
//             //urls
//             urls: {
//               facility: campground.FacilityURL,
//               campground: `https://www.recreation.gov/camping/campgrounds/${campground.FacilityID}`,
//               map: campground.FacilityMapURL
//             },
            
//             //directions
//             directions: campground.FacilityDirections,
            
//             //activities
//             activities: activities.map(activity => ({
//               id: activity.ActivityID,
//               name: activity.ActivityName,
//               description: activity.ActivityDescription
//             })),
            
//             //campsites
//             campsites: campsites.map(campsite => ({
//               id: campsite.CampsiteID,
//               name: campsite.CampsiteName,
//               type: campsite.CampsiteType,
//               use: campsite.TypeOfUse,
//               loop: campsite.Loop,
              
//               //amenities
//               amenities: {
//                 accessible: campsite.CampsiteAccessible,
//                 reservable: campsite.CampsiteReservable
//               },
              
//               //capacity
//               capacity: {
//                 maxPeople: campsite.CampsiteMaxPeople,
//                 maxVehicles: campsite.CampsiteMaxVehicles
//               },
              
//               //location
//               location: {
//                 latitude: campsite.CampsiteLatitude,
//                 longitude: campsite.CampsiteLongitude
//               },
              
//               //recreation.gov url
//               campsiteUrl: campsite.campsiteUrl,        
              
//               //media/images
//               media: campsite.media,
              
//               //permitted equipment
//               permittedEquipment: campsite.permittedEquipment,
              
//               //metadata
//               createdDate: campsite.CreatedDate,
//               lastUpdated: campsite.LastUpdatedDate
//             })),
            
//             //metadata
//             createdDate: campground.CreatedDate,
//             lastUpdated: campground.LastUpdatedDate
//           };
          
//           campgroundsWithCampsites.push(campgroundData);
//         }
//       } catch (err) {
//         logger.error(`Error fetching campsites for campground ${campground.FacilityID}:`, err.message);
//       }
//     }

//     console.log(`Found ${campgroundsWithCampsites.length} campgrounds with campsites`);
//     return campgroundsWithCampsites;
    
//   } catch (err) {
//     logger.error("Error fetching campgrounds by location:", err.message);
//     return [];
//   }
// }


// async function getActivitiesForFacility(facilityId) {
//   try {
//     const res = await fetch(`${RIDB_BASE}/facilities/${facilityId}/activities`, {
//       headers: { apikey: RIDB_API_KEY }
//     });
    
//     if (!res.ok) {
//       throw new Error(`HTTP error! status: ${res.status}`);
//     }
    
//     const data = await res.json();

//     const activities = data.RECDATA.map(activity => ({
//       ActivityID: activity.ActivityID,
//       ActivityName: activity.ActivityName,
//       ActivityDescription: activity.ActivityDescription
//     }));

//     return activities;
//   } catch (err) {
//     logger.error(`Error fetching activities for facility ${facilityId}:`, err.message);
//     return [];
//   }
// }

// async function getCampsitesForCampground(facilityId) {
//   try {
//     const res = await fetch(`${RIDB_BASE}/facilities/${facilityId}/campsites`, {
//       headers: { apikey: RIDB_API_KEY }
//     });
    
//     if (!res.ok) {
//       logger.error(`HTTP error! status: ${res.status}`);
//       throw new Error(`HTTP error! status: ${res.status}`);
//     }
    
//     const data = await res.json();

//     const campsites = data.RECDATA.map(campsite => ({
//       //basic campsite info
//       CampsiteID: campsite.CampsiteID,
//       CampsiteName: campsite.CampsiteName,
//       CampsiteType: campsite.CampsiteType,
//       TypeOfUse: campsite.TypeOfUse,
//       Loop: campsite.Loop,

//       //amenities
//       CampsiteAccessible: campsite.CampsiteAccessible,
//       CampsiteReservable: campsite.CampsiteReservable,
//       CampsiteLongitude: campsite.CampsiteLongitude,
//       CampsiteLatitude: campsite.CampsiteLatitude,

//       //capacity
//       CampsiteMaxPeople: campsite.CampsiteMaxPeople,
//       CampsiteMaxVehicles: campsite.CampsiteMaxVehicles,

//       //recreation.gov url
//       campsiteUrl: `https://www.recreation.gov/camping/campsites/${campsite.CampsiteID}`,

//       //media/images
//       media: campsite.ENTITYMEDIA ? campsite.ENTITYMEDIA.map(media => ({
//         url: media.URL
//       })) : [],
//       //permitted equipment
//       permittedEquipment: campsite.PERMITTEDEQUIPMENT ? campsite.PERMITTEDEQUIPMENT.map(equip => ({
//         name: equip.EquipmentName,
//         maxLength: equip.MaxLength
//       })) : [],

//       //metadata
//       createdDate: campsite.CreatedDate,
//       lastUpdated: campsite.LastUpdatedDate
//     }));

//     return campsites;
//   } catch (err) {
//     logger.error(`Error fetching campsites for facility ${facilityId}:`, err.message);
//     return [];
//   }
// }

// module.exports = {
//   getCampgroundsByLocation,
//   getCampsitesForCampground,
//   getActivitiesForFacility
// };