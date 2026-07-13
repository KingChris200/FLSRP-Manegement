const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    ChannelType,
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('issue')
        .setDescription('Issue a staff infraction.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)

        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('The channel where the infraction will be logged.')
                .addChannelTypes(
                    ChannelType.GuildText,
                    ChannelType.GuildAnnouncement
                )
                .setRequired(true)
        )

        .addUserOption(option =>
            option
                .setName('staff-member')
                .setDescription('The staff member receiving the infraction.')
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName('type')
                .setDescription('The type of staff action.')
                .setRequired(true)
                .addChoices(
                    {
                        name: '⚠️ Warning',
                        value: 'Warning',
                    },
                    {
                        name: '🟡 Strike 1',
                        value: 'Strike 1',
                    },
                    {
                        name: '🟠 Strike 2',
                        value: 'Strike 2',
                    },
                    {
                        name: '🔴 Strike 3',
                        value: 'Strike 3',
                    },
                    {
                        name: '🚫 Staff Suspension',
                        value: 'Staff Suspension',
                    },
                    {
                        name: '⛔ Staff Blacklist',
                        value: 'Staff Blacklist',
                    },
                    {
                        name: '❌ Termination',
                        value: 'Termination',
                    },
                    {
                        name: '📝 Note',
                        value: 'Note',
                    }
                )
        )

        .addStringOption(option =>
            option
                .setName('expiration')
                .setDescription('How long the action remains active.')
                .setRequired(true)
                .addChoices(
                    {
                        name: '2 Weeks',
                        value: '2 Weeks',
                    },
                    {
                        name: '1 Month',
                        value: '1 Month',
                    },
                    {
                        name: '2 Months',
                        value: '2 Months',
                    },
                    {
                        name: '3 Months',
                        value: '3 Months',
                    },
                    {
                        name: '4 Months',
                        value: '4 Months',
                    },
                    {
                        name: '5 Months',
                        value: '5 Months',
                    },
                    {
                        name: 'Permanent',
                        value: 'Permanent',
                    }
                )
        )

        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Reason for the staff action.')
                .setMaxLength(1000)
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName('evidence')
                .setDescription('Evidence link or additional information.')
                .setMaxLength(1000)
                .setRequired(false)
        )

        .addRoleOption(option =>
            option
                .setName('ping')
                .setDescription('Optional role to notify.')
                .setRequired(false)
        )

        .addStringOption(option =>
            option
                .setName('banner')
                .setDescription('Optional direct image URL.')
                .setRequired(false)
        ),


    async execute(interaction) {

        const channel =
            interaction.options.getChannel('channel');

        const staffMember =
            interaction.options.getUser('staff-member');

        const type =
            interaction.options.getString('type');

        const expiration =
            interaction.options.getString('expiration');

        const reason =
            interaction.options.getString('reason');

        const evidence =
            interaction.options.getString('evidence');

        const pingRole =
            interaction.options.getRole('ping');

        const banner =
            interaction.options.getString('banner');


        if (!channel || !channel.isTextBased()) {
            return interaction.reply({
                content:
                    '❌ Please choose a valid text channel.',
                ephemeral: true,
            });
        }


        if (banner) {

            try {

                const url = new URL(banner);

                if (
                    url.protocol !== 'https:' &&
                    url.protocol !== 'http:'
                ) {
                    throw new Error();
                }

            } catch {

                return interaction.reply({
                    content:
                        '❌ Please use a valid HTTP or HTTPS image URL.',
                    ephemeral: true,
                });

            }

        }


        const colors = {

            'Warning': 'Yellow',

            'Strike 1': 'Yellow',

            'Strike 2': 'Orange',

            'Strike 3': 'Red',

            'Staff Suspension': 'DarkOrange',

            'Staff Blacklist': 'DarkRed',

            'Termination': 'DarkRed',

            'Note': 'Blue',

        };


        const embed = new EmbedBuilder()

            .setColor(
                colors[type] || 'Red'
            )

            .setAuthor({

                name:
                    interaction.guild.name,

                iconURL:
                    interaction.guild.iconURL({
                        dynamic: true,
                    }) || undefined,

            })

            .setTitle(
                '⚠️ Staff Infraction Issued'
            )

            .setDescription(
                `${staffMember} has received an official staff action.`
            )

            .addFields(

                {
                    name:
                        '👤 Staff Member',

                    value:
                        `${staffMember}`,

                    inline: false,
                },

                {
                    name:
                        '📋 Infraction Type',

                    value:
                        type,

                    inline: true,
                },

                {
                    name:
                        '⏳ Expiration',

                    value:
                        expiration,

                    inline: true,
                },

                {
                    name:
                        '📝 Reason',

                    value:
                        reason,

                    inline: false,
                },

                {
                    name:
                        '🛡️ Issued By',

                    value:
                        `${interaction.user}`,

                    inline: false,
                }

            )

            .setFooter({

                text:
                    'FLSRP Management • Staff Discipline System',

                iconURL:
                    interaction.client.user.displayAvatarURL(),

            })

            .setTimestamp();



        if (evidence) {

            embed.addFields({

                name:
                    '📎 Evidence',

                value:
                    evidence,

                inline:
                    false,

            });

        }



        if (banner) {

            embed.setImage(banner);

        }



        try {

            await channel.send({

                content:
                    pingRole
                        ? `${pingRole}`
                        : undefined,

                embeds:
                    [embed],

                allowedMentions: {

                    roles:
                        pingRole
                            ? [pingRole.id]
                            : [],

                },

            });


            await interaction.reply({

                content:
                    `✅ ${type} has been issued successfully in ${channel}.`,

                ephemeral:
                    true,

            });


        } catch (error) {

            console.error(
                'Issue command error:',
                error
            );


            const response = {

                content:
                    '❌ I could not send the staff infraction. Check my permissions.',

                ephemeral:
                    true,

            };


            if (
                interaction.replied ||
                interaction.deferred
            ) {

                await interaction.followUp(response);

            } else {

                await interaction.reply(response);

            }

        }

    },

};