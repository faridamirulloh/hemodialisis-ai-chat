import React, { type Key } from 'react';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const isValidEmail = (email: string) => emailRegex.test(email);

const stringToSlug = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '-');

export const generateKeyEl = (key: Key, id?: Key) =>
  `${stringToSlug(String(key))}${id ? `--${stringToSlug(String(id))}` : ''}`;

// Helper to format text with markdown bold syntax (**text**) into JSX
export const formatBoldText = (text: string): React.ReactNode => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return React.createElement('strong', { key: i }, part.slice(2, -2));
    }
    return part;
  });
};

// Helper to format markdown text with bullets and bold into JSX
export const formatMarkdownText = (text: string): React.ReactNode => {
  // Split by lines to handle bullets
  const lines = text.split('\n');

  return lines.map((line, lineIndex) => {
    // Check for bullet point pattern '    *   ' or variations
    const bulletMatch = line.match(/^(\s*)\*\s+(.*)$/);

    let content: React.ReactNode;
    if (bulletMatch) {
      // Format the bullet content with bold formatting
      const bulletContent = formatBoldText(bulletMatch[2]);
      content = React.createElement(
        'div',
        { key: `line-${lineIndex}`, style: { display: 'flex', gap: '0.5rem', marginLeft: '1rem' } },
        React.createElement('span', null, '•'),
        React.createElement('span', null, bulletContent),
      );
    } else {
      // Apply bold formatting to regular text
      content = formatBoldText(line);
      if (lineIndex < lines.length - 1) {
        content = React.createElement('span', { key: `line-${lineIndex}` }, content, '\n');
      }
    }

    return content;
  });
};

// Helper to clean up chat message text (removes ' || ' from end)
export const cleanChatMessage = (text: string): string => {
  // Remove ' || ' from the end of the message if present
  return text.replace(/\s*\|\|\s*$/, '').trim();
};
