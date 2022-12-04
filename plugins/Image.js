import fetch from "node-fetch";

export default {
  rules: [
    `You are an AI that's good at describing images.`,
    `First check if my message includes the word "image", "photo", "picture", or "drawing"`,
    `If it does include one of those words then at the very end of your reply you should include an image description enclosed in double curly brackets.`,
    `If it does not include one of those words then don't add an image description.`,
    `Here's an example: If I asked for "your opinion on cats with a picture" you might reply "I'm a big fan of cats {{beautiful siamese cat laying in the sun}}`,
    `If I just ask for "your opinion on cats" you'd just reply "I'm a big fan of cats" and not include an image description`,
  ],
  parse: async (reply) => {
    // Match anything between {{ }}
    const regex = /\{\{([^\]]+?)\}\}/g;
    const matches = reply.match(regex);
    if (matches?.length) {
      for (const match of matches) {
        // Get image description between curly brackets
        const imageDescription = match.replace(regex, "$1");
        // Search for image on Lexica
        const image = await fetch(
          `https://lexica.art/api/v1/search?q=${encodeURIComponent(
            imageDescription
          )}`,
          {
            method: "GET",
          }
        )
          .then((response) => response.json())
          .then((response) => {
            if (response?.images) {
              return `https://image.lexica.art/md/${response?.images[0]?.id}`;
            }
          })
          .catch(() => {
            console.log("Error: Could not get image from Lexica");
          });

        // Replace description with image URL
        reply = reply.replace(`\{\{${imageDescription}\}\}`, image);
      }
      console.log(`Reply with parsed images: ${reply}\n`);
    }
    return reply;
  },
};
