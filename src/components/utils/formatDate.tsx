export function formatDate(dateTime: string): string {
    const date = new Date(dateTime);

    const day = date.getDate();
    const month = date.toLocaleDateString("pt-BR", {
        month: "long"
    });

    return `${day} de ${month}`;
}