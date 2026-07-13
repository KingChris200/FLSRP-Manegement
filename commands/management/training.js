const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    ChannelType,
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('training')
        .setDescription('Manage staff training requests.')

        .addSubcommand(subcommand =>
            subcommand
                .setName('request')
                .setDescription('Submit a request for staff training.')

                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription(
                            'The channel where the training request will be sent.'
                        )
                        .addChannelTypes(
                            ChannelType.GuildText,
                            ChannelType.GuildAnnouncement
                        )
                        .setRequired(true)
                )

                .addStringOption(option =>
                    option
                        .setName('roblox-username')
                        .setDescription('Your Roblox username.')
                        .setMaxLength(50)
                        .setRequired(true)
                )

                .addStringOption(option =>
                    option
                        .setName('when')
                        .setDescription(
                            'When you are available for training.'
                        )
                        .setMaxLength(100)
                        .setRequired(true)
                )

                .addStringOption(option =>
                    option
                        .setName('timezone')
                        .setDescription('Your time zone.')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Eastern Time', value: 'ET' },
                            { name: 'Central Time', value: 'CT' },
                            { name: 'Mountain Time', value: 'MT' },
                            { name: 'Pacific Time', value: 'PT' },
                            { name: 'Other', value: 'Other' }
                        )
                )

                .addStringOption(option =>
                    option
                        .setName('whitelisted-group')
                        .setDescription(
                            'Are you currently in the whitelisted Roblox group?'
                        )
                        .setRequired(true)
                        .addChoices(
                            { name: 'Yes', value: 'Yes' },
                            { name: 'No', value: 'No' }
                        )
                )

                .addStringOption(option =>
                    option
                        .setName('notes')
                        .setDescription(
                            'Optional additional information.'
                        )
                        .setMaxLength(1000)
                        .setRequired(false)
                )

                .addStringOption(option =>
                    option
                        .setName('banner')
                        .setDescription(
                            'Optional direct image URL for a training banner.'
                        )
                        .setRequired(false)
                )

                .addRoleOption(option =>
                    option
                        .setName('ping')
                        .setDescription(
                            'Optional training-team role to notify.'
                        )
                        .setRequired(false)
                )
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand !== 'request') return;

        const channel =
            interaction.options.getChannel('channel');

        const robloxUsername =
            interaction.options.getString('roblox-username');

        const when =
            interaction.options.getString('when');

        const timezone =
            interaction.options.getString('timezone');

        const whitelistedGroup =
            interaction.options.getString('whitelisted-group');

        const notes =
            interaction.options.getString('notes');

        const banner =
            interaction.options.getString('banner');

        const pingRole =
            interaction.options.getRole('ping');

        if (!channel || !channel.isTextBased()) {
            return interaction.reply({
                content: '❌ Please choose a valid text channel.',
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
                    throw new Error('Unsupported protocol');
                }
            } catch {
                return interaction.reply({
                    content:
                        '❌ The banner URL is invalid. Please use a direct HTTP or HTTPS image link.',
                    ephemeral: true,
                });
            }
        }

        const embed = new EmbedBuilder()
            .setColor('Aqua')
            .setAuthor({
                name: interaction.guild.name,
                iconURL:
                    interaction.guild.iconURL({
                        dynamic: true,
                    }) || undefined,
            })
            .setTitle('🎓 Training Request')
            .setDescription(
                'A new staff training request has been submitted.'
            )
            .addFields(
                {
                    name: '👤 Discord User',
                    value: `${interaction.user}`,
                    inline: false,
                },
                {
                    name: '🎮 Roblox Username',
                    value: `\`${robloxUsername}\``,
                    inline: false,
                },
                {
                    name: '🗓️ Availability',
                    value: when,
                    inline: true,
                },
                {
                    name: '🌎 Time Zone',
                    value: timezone,
                    inline: true,
                },
                {
                    name: '✅ Whitelisted Group',
                    value: whitelistedGroup,
                    inline: true,
                }
            )
            .setFooter({
                text: 'FLSRP Management • Training System',
                iconURL:
                    interaction.client.user.displayAvatarURL(),
            })
            .setTimestamp();

        if (notes) {
            embed.addFields({
                name: '📝 Additional Information',
                value: notes,
                inline: false,
            });
        }

        if (banner) {
            embed.setImage(banner);
        }

        try {
            await channel.send({
                content: pingRole ? `${pingRole}` : undefined,
                embeds: [embed],
                allowedMentions: {
                    roles: pingRole ? [pingRole.id] : [],
                },
            });

            await interaction.reply({
                content:
                    `✅ Your training request was submitted successfully in ${channel}.`,
                ephemeral: true,
            });
        } catch (error) {
            console.error('Training request error:', error);

            const response = {
                content:
                    '❌ I could not submit the training request. Make sure I can view the channel, send messages, and embed links.',
                ephemeral: true,
            };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(response);
            } else {
                await interaction.reply(response);
            }
        }
    },
};