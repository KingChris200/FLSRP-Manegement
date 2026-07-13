const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    ChannelType,
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warnstaff')
        .setDescription('Issue and announce a warning to a staff member.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)

        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('The channel where the warning will be logged.')
                .addChannelTypes(
                    ChannelType.GuildText,
                    ChannelType.GuildAnnouncement
                )
                .setRequired(true)
        )

        .addUserOption(option =>
            option
                .setName('staff-member')
                .setDescription('The staff member receiving the warning.')
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName('warning-level')
                .setDescription('The severity of the warning.')
                .setRequired(true)
                .addChoices(
                    {
                        name: '⚠️ Verbal Warning',
                        value: 'Verbal Warning',
                    },
                    {
                        name: '🟡 Warning 1',
                        value: 'Warning 1',
                    },
                    {
                        name: '🟠 Warning 2',
                        value: 'Warning 2',
                    },
                    {
                        name: '🔴 Warning 3',
                        value: 'Warning 3',
                    },
                    {
                        name: '🚨 Final Warning',
                        value: 'Final Warning',
                    }
                )
        )

        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('The reason for issuing the warning.')
                .setMaxLength(1000)
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName('evidence')
                .setDescription(
                    'Optional evidence link or short evidence description.'
                )
                .setMaxLength(1000)
                .setRequired(false)
        )

        .addStringOption(option =>
            option
                .setName('expires')
                .setDescription(
                    'Optional expiration, such as 30 days or Permanent.'
                )
                .setMaxLength(100)
                .setRequired(false)
        )

        .addRoleOption(option =>
            option
                .setName('ping')
                .setDescription('Optional management role to notify.')
                .setRequired(false)
        )

        .addStringOption(option =>
            option
                .setName('banner')
                .setDescription(
                    'Optional direct HTTP or HTTPS banner image URL.'
                )
                .setRequired(false)
        ),

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const staffMember =
            interaction.options.getUser('staff-member');
        const warningLevel =
            interaction.options.getString('warning-level');
        const reason = interaction.options.getString('reason');
        const evidence =
            interaction.options.getString('evidence');
        const expires = interaction.options.getString('expires');
        const pingRole = interaction.options.getRole('ping');
        const banner = interaction.options.getString('banner');

        if (!channel || !channel.isTextBased()) {
            return interaction.reply({
                content: '❌ Please choose a valid text channel.',
                ephemeral: true,
            });
        }

        if (staffMember.bot) {
            return interaction.reply({
                content: '❌ You cannot issue a staff warning to a bot.',
                ephemeral: true,
            });
        }

        if (staffMember.id === interaction.user.id) {
            return interaction.reply({
                content: '❌ You cannot issue a staff warning to yourself.',
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
                    throw new Error('Invalid protocol');
                }
            } catch {
                return interaction.reply({
                    content:
                        '❌ Please provide a valid HTTP or HTTPS banner URL.',
                    ephemeral: true,
                });
            }
        }

        const warningColors = {
            'Verbal Warning': 'Yellow',
            'Warning 1': 'Yellow',
            'Warning 2': 'Orange',
            'Warning 3': 'Red',
            'Final Warning': 'DarkRed',
        };

        const warningEmojis = {
            'Verbal Warning': '⚠️',
            'Warning 1': '🟡',
            'Warning 2': '🟠',
            'Warning 3': '🔴',
            'Final Warning': '🚨',
        };

        const embed = new EmbedBuilder()
            .setColor(warningColors[warningLevel] || 'Red')
            .setAuthor({
                name: interaction.guild.name,
                iconURL:
                    interaction.guild.iconURL({
                        dynamic: true,
                    }) || undefined,
            })
            .setTitle(
                `${warningEmojis[warningLevel] || '⚠️'} Staff Warning`
            )
            .setDescription(
                `${staffMember} has received an official staff warning.`
            )
            .addFields(
                {
                    name: '👤 Staff Member',
                    value: `${staffMember}`,
                    inline: false,
                },
                {
                    name: '⚖️ Warning Level',
                    value: warningLevel,
                    inline: true,
                },
                {
                    name: '🛡️ Issued By',
                    value: `${interaction.user}`,
                    inline: true,
                },
                {
                    name: '📝 Reason',
                    value: reason,
                    inline: false,
                }
            )
            .setFooter({
                text: 'FLSRP Management • Staff Accountability System',
                iconURL:
                    interaction.client.user.displayAvatarURL(),
            })
            .setTimestamp();

        if (evidence) {
            embed.addFields({
                name: '📎 Evidence',
                value: evidence,
                inline: false,
            });
        }

        if (expires) {
            embed.addFields({
                name: '⏳ Expiration',
                value: expires,
                inline: true,
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
                    `✅ The staff warning for ${staffMember} was logged successfully in ${channel}.`,
                ephemeral: true,
            });
        } catch (error) {
            console.error('Staff warning command error:', error);

            const response = {
                content:
                    '❌ I could not log the warning. Make sure I can view the channel, send messages, and embed links.',
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