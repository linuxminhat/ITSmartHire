/**
 * Formats a Date object or a date string into 'YYYY-MM-DD' format suitable for <input type="date">.
 * Handles potential invalid date inputs gracefully.
 */
export const formatDateForInput = (date: string | Date | undefined | null): string => {
    if (!date) return '';
    try {
        const d = new Date(date);
        // Check if the date is valid after parsing
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

/**
 * Parses a date string (expected format 'YYYY-MM-DD' from <input type="date">) 
 * into a Date object.
 * Returns null if the input string is empty or invalid.
 */
export const parseDateFromInput = (dateString: string | undefined | null): Date | null => {
    if (!dateString) return null;
    try {
        // Input type="date" provides 'YYYY-MM-DD'
        // Adding time component to ensure it's parsed in local timezone correctly,
        // avoiding potential off-by-one day issues due to UTC conversion.
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

/**
 * Formats a Date object or string into a more readable format (e.g., 'DD/MM/YYYY')
 * for display purposes.
 */
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