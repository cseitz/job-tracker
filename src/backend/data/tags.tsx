import { Icon } from '@cseitz/icons'
import { faJs } from '@cseitz/icons-brands/js';
import { faReact } from '@cseitz/icons-brands/react'
import { faStar } from '@cseitz/icons-regular/star';
import type { MantineColor } from '@mantine/core';

const StarIcon = Icon(faStar);
const ReactIcon = Icon(faReact);
const JavaScriptIcon = Icon(faJs);

type TagDefinition = {
    label: string,
    color: MantineColor,
    icon: (...args: any[]) => JSX.Element,
}

export const Tags = {
    fav: {
        label: 'Favorite',
        color: 'yellow.5',
        icon: StarIcon,
    },
    react: {
        label: 'React',
        color: 'cyan.3',
        icon: ReactIcon,
    },
    js: {
        label: 'JavaScript',
        color: 'yellow.4',
        icon: JavaScriptIcon,
    },
} satisfies Record<string, TagDefinition>;

type TagKey = keyof typeof Tags;
const keys = Object.keys(Tags);
export function parseTags(input: Set<TagKey> | TagKey[] | Set<any> | string[]) {
    const tags = [...new Set([...input as any]) as any] as TagKey[];
    tags.sort((a, b) => keys.indexOf(b) > keys.indexOf(a) ? -1 : 1);
    return tags;
}

// console.log(['fav', 'js', 'react'], parseTags(['fav', 'js', 'react']))
// console.log(['react', 'js'], parseTags(['react', 'js']))

