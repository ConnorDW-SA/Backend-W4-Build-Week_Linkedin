import imageToBase64 from "image-to-base64";
import PdfPrinter from "pdfmake";

export const getPDFReadableStream = async (user) => {
  async function createBase64Img(url) {
    let base64Encoded = await imageToBase64(url);
    return "data:image/jpeg;base64, " + base64Encoded;
  }
  const fonts = {
    Roboto: {
      normal: "Helvetica",
      bold: "Helvetica",
      italics: "Helvetica",
    },
  };

  const printer = new PdfPrinter(fonts);

  const docDefinition = {
    content: [
      {
        text: user.name + " " + user.surname,
        fontSize: 30,
        alignment: "center",
        margin: [0, 15, 0, 0],
      },
      {
        text: user.title,
        fontSize: 15,
        alignment: "center",
        margin: [0, 15, 0, 0],
      },
      {
        text: user.area,
        fontSize: 15,
        alignment: "center",
        margin: [0, 15, 0, 0],
      },
      {
        image: "main",
        width: 200,
        alignment: "center",
      },
    ],
    images: {
      main: await createBase64Img(user.image),
    },
  };

  const pdfReadableStream = printer.createPdfKitDocument(docDefinition);
  pdfReadableStream.end();

  return pdfReadableStream;
};
