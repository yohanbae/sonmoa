export interface Friend{
    uid:string;
    displayName:string;
    friends: [
        {
            status:string;
            displayName:string;
            uid:string;
            email:string;       
        }
    ]
}