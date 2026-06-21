/**
 * Supabase Storage helpers for contractor logos and gallery.
 */
(function() {
    'use strict';

    const sb = window.sb;
    if (!sb) {
        throw new Error('Supabase client not initialised. Load supabase-client.js first.');
    }

    async function getUserId() {
        const { data: { session } } = await sb.auth.getSession();
        return session?.user?.id || null;
    }

    async function uploadLogo(file) {
        const userId = await getUserId();
        if (!userId) return { data: null, error: new Error('Not authenticated') };
        const ext = file.name.split('.').pop();
        const path = `${userId}/logo.${ext}`;
        return sb.storage.from('contractor-logos').upload(path, file, { upsert: true });
    }

    async function uploadGalleryImage(file, caption) {
        const userId = await getUserId();
        if (!userId) return { data: null, error: new Error('Not authenticated') };
        const ext = file.name.split('.').pop();
        const name = `${Date.now()}.${ext}`;
        const path = `${userId}/${name}`;
        const { data, error } = await sb.storage.from('contractor-gallery').upload(path, file);
        if (error) return { data: null, error };
        const { data: publicUrl } = sb.storage.from('contractor-gallery').getPublicUrl(path);
        return {
            data: { path, publicUrl: publicUrl?.publicUrl, caption },
            error: null
        };
    }

    async function deleteFile(bucket, path) {
        return sb.storage.from(bucket).remove([path]);
    }

    function getPublicUrl(bucket, path) {
        const { data } = sb.storage.from(bucket).getPublicUrl(path);
        return data?.publicUrl || null;
    }

    window.Storage = {
        uploadLogo,
        uploadGalleryImage,
        deleteFile,
        getPublicUrl
    };
})();
