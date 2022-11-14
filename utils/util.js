const organizeArtData = (originData) => {
  const artData = {};

  artData.artId = originData.artId;
  artData.title = originData.title;
  artData.description = originData.description;
  artData.category = originData.category;
  artData.tags = originData.tags;
  artData.crops = originData.crops;
  artData.imageUrl = originData.artUrl;
  artData.largeThumbUrl = originData.largeThumbUrl;
  artData.mediumThumbUrl = originData.mediumThumbUrl;
  artData.smallThumbUrl = originData.smallThumbUrl;
  artData.squareThumbUrl = originData.squareThumbUrl;
  artData.userId = originData.userId;
  artData.prixerUsername = originData.prixerUsername;
  artData.status = originData.status;
  artData.artType = originData.artType;
  artData.originalPhotoWidth = originData.originalPhotoWidth;
  artData.originalPhotoHeight = originData.originalPhotoHeight;
  artData.originalPhotoIso = originData.originalPhotoIso;
  artData.originalPhotoPpi = originData.originalPhotoPpi;
  artData.artLocation = originData.artLocation || "";

  return artData;
};

module.exports = { organizeArtData };
