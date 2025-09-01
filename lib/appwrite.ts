import { Account, AppwriteException, Avatars, Client, Databases, OAuthProvider, Query } from 'react-native-appwrite'
import * as Linking from 'expo-linking'
import {openAuthSessionAsync} from 'expo-web-browser';

export const config = {
    platform: 'com.restate.app',
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
    databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
    galleriesCollectionId: process.env.EXPO_PUBLIC_APPWRITE_GALLERIES_TABLE_ID,
    reviewsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_REVIEWS_TABLE_ID,
    agentsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_AGENTS_TABLE_ID,
    propertiesCollectionId: process.env.EXPO_PUBLIC_APPWRITE_PROPERTIES_TABLE_ID
}

export const client = new Client();

client
    .setEndpoint(config.endpoint!)
    .setProject(config.projectId!)
    .setPlatform(config.platform!)

export const avatar = new Avatars(client);
export const account = new Account(client);
export const databases = new Databases(client);

export async function logIn() {
    try {
        const redirectUri = Linking.createURL('/');
        const response = await account.createOAuth2Token(OAuthProvider.Google, redirectUri);

        if(!response) throw new Error("Failed to Login");

        const browserResult = await openAuthSessionAsync(response.toString(), redirectUri);

        if(browserResult.type !== 'success') throw new Error('Failed to login');

        const url = new URL(browserResult.url);

        const secret = url.searchParams.get('secret')?.toString();
        const userId = url.searchParams.get('userId')?.toString();

        if(!secret || !userId) throw new Error('Failed to login');

        const session = await account.createSession(userId, secret);

        if(!session) throw new Error('Failed to create a session');

        return session;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export async function logOut() {
    try {
        await account.deleteSession('current');
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export async function getCurrentUser() {
    try {
        const response = await account.get();

        if(response.$id){
            const userAvatar = `https://fra.cloud.appwrite.io/v1/avatars/initials?name=${encodeURIComponent(response.name || response.email)}`;

            return {
                ...response,
                avatar: userAvatar
            }
        }
    } catch (error) {
        if (error instanceof AppwriteException) {
            if (error.code === 401 || error.message.includes("missing scopes")) {
            return null;
            }
        }
        console.error(error);
        return null;
    }
}

export async function getLatestProperties() {
    try {
        const result = await databases.listDocuments(
            config.databaseId!,
            config.propertiesCollectionId!,
            [Query.orderAsc('$createdAt'), Query.limit(5)]
        )
        return result.documents;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getproperties({ filter, query, limit }: {
    filter: string;
    query: string;
    limit?: number
}) {
    try {
        const buildQuery = [Query.orderDesc('$createdAt')];

        if(filter && filter !== 'All') buildQuery.push(Query.equal('type', filter))
        
        if(query){
            buildQuery.push(
                Query.or([
                    Query.search('name', query),
                    Query.search('address', query),
                    Query.search('type', query)
                ])
            )
        }

        if(limit) buildQuery.push(Query.limit(limit));

        const result = await databases.listDocuments(
            config.databaseId!,
            config.propertiesCollectionId!,
            buildQuery
        )
        
        return result.documents;
         
    } catch (error) {
        console.error(error);
        return [];
    }
}