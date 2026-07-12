const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    ChannelType,
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('session')
        .setDescription('Start or end an ER:LC roleplay session.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)

        .addSubcommand(subcommand =>
            subcommand
                .setName('start')
                .setDescription('Announce the start of a roleplay session.')

                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription('Where the session announcement should be sent.')
                        .addChannelTypes(
                            ChannelType.GuildText,
                            ChannelType.GuildAnnouncement
                        )
                        .setRequired(true)
                )

                .addStringOption(option =>
                    option
                        .setName('server-code')
                        .setDescription('The ER:LC private server code.')
                        .setMaxLength(50)
                        .setRequired(true)
                )

                .addUserOption(option =>
                    option
                        .setName('host')
                        .setDescription('The person hosting the session.')
                        .setRequired(true)
                )

                .addUserOption(option =>
                    option
                        .setName('co-host')
                        .setDescription('An optional co-host for the session.')
                        .setRequired(false)
                )

                .addStringOption(option =>
                    option
                        .setName('departments')
                        .setDescription('Open departments, such as LEO, FD, DOT, and Civilian.')
                        .setMaxLength(500)
                        .setRequired(false)
                )

                .addRoleOption(option =>
                    option
                        .setName('ping')
                        .setDescription('An optional role to ping.')
                        .setRequired(false)
                )

                .addStringOption(option =>
                    option
                        .setName('notes')
                        .setDescription('Optional extra information about the session.')
                        .setMaxLength(1000)
                        .setRequired(false)
                )
        )

        .addSubcommand(subcommand =>
            subcommand
                .setName('end')
                .setDescription('Announce that the roleplay session has ended.')

                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription('Where the ending announcement should be sent.')
                        .addChannelTypes(
                            ChannelType.GuildText,
                            ChannelType.GuildAnnouncement
                        )
                        .setRequired(true)
                )

                .addUserOption(option =>
                    option
                        .setName('host')
                        .setDescription('The person who hosted the session.')
                        .setRequired(true)
                )

                .addStringOption(option =>
                    option
                        .setName('message')
                        .setDescription('An optional closing message.')
                        .setMaxLength(1000)
                        .setRequired(false)
                )
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const channel = interaction.options.getChannel('channel');

        if (!channel || !channel.isTextBased()) {
            return interaction.reply({
                content: '❌ Please select a valid text channel.',
                ephemeral: true,
            });
        }

        if (subcommand === 'start') {
            const serverCode =
                interaction.options.getString('server-code');

            const host =
                interaction.options.getUser('host');

            const coHost =
                interaction.options.getUser('co-host');

            const departments =
                interaction.options.getString('departments') ||
                'LEO, Fire/EMS, DOT, and Civilian';

            const pingRole =
                interaction.options.getRole('ping');

            const notes =
                interaction.options.getString('notes');

            const embed = new EmbedBuilder()
                .setColor('Green')
                .setAuthor({
                    name: interaction.guild.name,
                    iconURL:
                        interaction.guild.iconURL({ dynamic: true }) ||
                        undefined,
                })
                .setTitle('🚔 Public Roleplay Session')
                .setDescription(
                    'A new Florida State Roleplay session is now starting! Join the server using the information below.'
                )
                .addFields(
                    {
                        name: '🔑 Server Code',
                        value: `\`${serverCode}\``,
                        inline: true,
                    },
                    {
                        name: '👑 Host',
                        value: `${host}`,
                        inline: true,
                    },
                    {
                        name: '🤝 Co-Host',
                        value: coHost ? `${coHost}` : 'None',
                        inline: true,
                    },
                    {
                        name: '🏢 Departments Open',
                        value: departments,
                        inline: false,
                    }
                )
                .setFooter({
                    text: `Session announced by ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL({
                        dynamic: true,
                    }),
                })
                .setTimestamp();

            if (notes) {
                embed.addFields({
                    name: '📝 Additional Information',
                    value: notes,
                    inline: false,
                });
            }

            try {
                await channel.send({
                    content: pingRole ? `${pingRole}` : undefined,
                    embeds: [embed],
                    allowedMentions: {
                        roles: pingRole ? [pingRole.id] : [],
                    },
                });

                return interaction.reply({
                    content: `✅ Session announcement sent in ${channel}.`,
                    ephemeral: true,
                });
            } catch (error) {
                console.error('Session start error:', error);

                return interaction.reply({
                    content:
                        '❌ I could not send the session announcement. Check my channel permissions.',
                    ephemeral: true,
                });
            }
        }

        if (subcommand === 'end') {
            const host =
                interaction.options.getUser('host');

            const closingMessage =
                interaction.options.getString('message') ||
                'Thank you to everyone who participated. We hope you enjoyed the session!';

            const embed = new EmbedBuilder()
                .setColor('Red')
                .setAuthor({
                    name: interaction.guild.name,
                    iconURL:
                        interaction.guild.iconURL({ dynamic: true }) ||
                        undefined,
                })
                .setTitle('🛑 Roleplay Session Concluded')
                .setDescription(closingMessage)
                .addFields({
                    name: '👑 Session Host',
                    value: `${host}`,
                    inline: true,
                })
                .setFooter({
                    text: `Session ended by ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL({
                        dynamic: true,
                    }),
                })
                .setTimestamp();

            try {
                await channel.send({
                    embeds: [embed],
                });

                return interaction.reply({
                    content: `✅ Session ending announcement sent in ${channel}.`,
                    ephemeral: true,
                });
            } catch (error) {
                console.error('Session end error:', error);

                return interaction.reply({
                    content:
                        '❌ I could not send the ending announcement. Check my channel permissions.',
                    ephemeral: true,
                });
            }
        }
    },
};