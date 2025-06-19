//date data formatting and parsing
export const formatDateForInput = (date: string | Date | undefined | null): string => {
    if (!date) return '';
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) {
            return '';
        }
        const year = d.getFullYear();
        // getMonth() is 0-indexed, so add 1
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (error) {
        console.error("Error formatting date:", error);
        return ''; // Return empty string on error
    }
};

export const parseDateFromInput = (dateString: string | undefined | null): Date | null => {
    if (!dateString) return null;
    try {

        const date = new Date(`${dateString}T00:00:00`);
        if (isNaN(date.getTime())) {
            return null; // Invalid date string
        }
        return date;
    } catch (error) {
        console.error("Error parsing date string:", error);
        return null;
    }
};

export const formatDisplayDate = (date: string | Date | undefined | null): string => {
    if (!date) return 'N/A';
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) {
            return 'N/A';
        }
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    } catch (error) {
        console.error("Error formatting display date:", error);
        return 'N/A';
    }
}; 