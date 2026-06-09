-- Add cover images for the two JOAT-specific articles.

update public.blog_posts
set cover_image = '/blog-covers/digital-business-cards.svg',
    updated_at = now()
where slug = 'digital-business-cards-in-kenya';

update public.blog_posts
set cover_image = '/blog-covers/roblox-game-development.svg',
    updated_at = now()
where slug = 'roblox-game-development-in-africa';
