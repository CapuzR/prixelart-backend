const organizeArtData = (originData) => {
  const artData = {};

  artData.artId = originData.artId;
  artData.artLocation = originData.artLocation || "";
  artData.artType = originData.artType;
  artData.category = originData.category;
  artData.comission = originData.comission;
  artData.exclusive = originData.exclusive;
  artData.crops = originData.crops;
  artData.description = originData.description;
  artData.imageUrl = originData.artUrl;
  artData.largeThumbUrl = originData.largeThumbUrl;
  artData.mediumThumbUrl = originData.mediumThumbUrl;
  artData.originalPhotoHeight = originData.originalPhotoHeight;
  artData.originalPhotoIso = originData.originalPhotoIso;
  artData.originalPhotoPpi = originData.originalPhotoPpi;
  artData.originalPhotoWidth = originData.originalPhotoWidth;
  artData.prixerUsername = originData.prixerUsername;
  artData.smallThumbUrl = originData.smallThumbUrl;
  artData.squareThumbUrl = originData.squareThumbUrl;
  artData.status = originData.status;
  artData.tags = originData.tags;
  artData.title = originData.title;
  artData.userId = originData.userId;
art.createdOn = new Date();
  return artData;
};

module.exports = { organizeArtData };
