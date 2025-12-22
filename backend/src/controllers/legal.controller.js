/**
 * Get Privacy Policy
 */
exports.getPrivacyPolicy = async (req, res, next) => {
    try {
        const privacyPolicy = {
            success: true,
            lastUpdated: '2025-01-01',
            version: '1.0',
            appName: 'NextGenX Hub',
            contactEmail: 'nxgextra@gmail.com',
            sections: [
                {
                    title: 'Introduction',
                    content: 'Welcome to NextGenX Hub. We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our mobile application.'
                },
                {
                    title: 'App Permissions',
                    content: 'NextGenX Hub requires certain permissions to function properly. Below is a detailed explanation of each permission and why we need it:',
                    items: [
                        {
                            subtitle: 'Storage Access (READ_EXTERNAL_STORAGE, WRITE_EXTERNAL_STORAGE)',
                            content: 'Required to save QR codes you generate to your device gallery and access saved files. We only access files you explicitly choose to interact with.'
                        },
                        {
                            subtitle: 'Media Library Access (READ_MEDIA_IMAGES, READ_MEDIA_VIDEO, READ_MEDIA_AUDIO)',
                            content: 'Allows the app to save generated QR codes to your photo gallery. On Android 13+, these granular permissions replace the broader storage permissions.'
                        },
                        {
                            subtitle: 'Media Location Access (ACCESS_MEDIA_LOCATION)',
                            content: 'Used only when saving QR codes with location metadata. This is optional and only accessed when explicitly needed.'
                        },
                        {
                            subtitle: 'Internet Access',
                            content: 'Required to fetch tools, apps, videos, and other content from our servers. Also used for push notifications and analytics.'
                        },
                        {
                            subtitle: 'Push Notifications',
                            content: 'Used to send you updates about new tools, apps, videos, and important announcements. You can disable this in your device settings at any time.'
                        },
                        {
                            subtitle: 'Camera Access (When Applicable)',
                            content: 'If you use QR code scanning features, camera access is required. The camera is only activated when you explicitly use the scanner.'
                        }
                    ]
                },
                {
                    title: 'Permission Usage Principles',
                    items: [
                        'We only request permissions that are essential for app functionality',
                        'Permissions are requested at the time they are needed, not all at once',
                        'You can revoke any permission at any time through your device settings',
                        'The app will continue to work with limited functionality if you deny certain permissions',
                        'We never access your data beyond what is necessary for the requested feature'
                    ]
                },
                {
                    title: 'Information We Collect',
                    items: [
                        {
                            subtitle: 'Device Information',
                            content: 'We collect device identifiers, operating system version, and device model to provide push notifications and improve app performance.'
                        },
                        {
                            subtitle: 'Usage Data',
                            content: 'We collect anonymous usage statistics including pages visited, features used, and app interaction patterns to enhance user experience.'
                        },
                        {
                            subtitle: 'Push Notification Tokens',
                            content: 'We store Firebase Cloud Messaging tokens to send you important updates and notifications.'
                        }
                    ]
                },
                {
                    title: 'How We Use Your Information',
                    items: [
                        'To provide and maintain our service',
                        'To send push notifications about updates and new features',
                        'To analyze usage patterns and improve app functionality',
                        'To provide customer support',
                        'To detect and prevent technical issues'
                    ]
                },
                {
                    title: 'Data Storage and Security',
                    content: 'Your data is stored securely using Firebase services with industry-standard encryption. We implement appropriate security measures to protect against unauthorized access, alteration, disclosure, or destruction of your information.'
                },
                {
                    title: 'Third-Party Services',
                    items: [
                        {
                            subtitle: 'Firebase',
                            content: 'We use Firebase for analytics, push notifications, and data storage. Firebase is operated by Google and has its own privacy policy.'
                        },
                        {
                            subtitle: 'Google Analytics',
                            content: 'We use Google Analytics to understand how users interact with our app. This data is anonymized and aggregated.'
                        }
                    ]
                },
                {
                    title: 'Your Rights',
                    items: [
                        'Access your personal data',
                        'Request correction of inaccurate data',
                        'Request deletion of your data',
                        'Opt-out of push notifications',
                        'Withdraw consent at any time'
                    ]
                },
                {
                    title: 'Data Retention',
                    content: 'We retain your device information and usage data for as long as necessary to provide our services. You can request deletion of your data at any time by contacting us.'
                },
                {
                    title: 'Children\'s Privacy',
                    content: 'Our app is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.'
                },
                {
                    title: 'Changes to This Policy',
                    content: 'We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.'
                },
                {
                    title: 'Contact Us',
                    content: 'If you have any questions about this Privacy Policy, please contact us at nxgextra@gmail.com'
                }
            ]
        };

        res.json(privacyPolicy);
    } catch (error) {
        next(error);
    }
};

/**
 * Get Terms of Service
 */
exports.getTermsOfService = async (req, res, next) => {
    try {
        const termsOfService = {
            success: true,
            lastUpdated: '2025-01-01',
            version: '1.0',
            appName: 'NextGenX Hub',
            contactEmail: 'nxgextra@gmail.com',
            sections: [
                {
                    title: 'Acceptance of Terms',
                    content: 'By downloading, installing, or using NextGenX Hub, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our app.'
                },
                {
                    title: 'Use of Service',
                    items: [
                        'You must be at least 13 years old to use this app',
                        'You agree to use the app only for lawful purposes',
                        'You are responsible for maintaining the confidentiality of your device',
                        'You agree not to misuse or attempt to disrupt the service'
                    ]
                },
                {
                    title: 'Intellectual Property',
                    content: 'All content, features, and functionality of NextGenX Hub are owned by NextGenX and are protected by copyright, trademark, and other intellectual property laws.'
                },
                {
                    title: 'Disclaimer',
                    content: 'NextGenX Hub is provided "as is" without warranties of any kind. We do not guarantee that the app will be error-free or uninterrupted.'
                },
                {
                    title: 'Limitation of Liability',
                    content: 'NextGenX shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the app.'
                },
                {
                    title: 'Changes to Terms',
                    content: 'We reserve the right to modify these terms at any time. Continued use of the app after changes constitutes acceptance of the new terms.'
                },
                {
                    title: 'Contact',
                    content: 'For questions about these Terms of Service, contact us at nxgextra@gmail.com'
                }
            ]
        };

        res.json(termsOfService);
    } catch (error) {
        next(error);
    }
};
