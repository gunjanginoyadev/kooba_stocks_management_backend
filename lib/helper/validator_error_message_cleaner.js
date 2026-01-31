export const validationErrorMessageCleaner = (message) => {
    return message.replaceAll('"', "");
}